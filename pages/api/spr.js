// 90-day fitness plan for /spr, stored in Turso (hosted SQLite / libSQL).
//
//   TURSO_DATABASE_URL="libsql://spr-you.turso.io"  added by Vercel's Turso integration
//   TURSO_AUTH_TOKEN="..."
//   SPR_KEY="some-long-random-string"  every request needs it (x-spr-key header); the page
//                                      picks it up once from /spr?key=... and remembers it.
//
// Without TURSO_DATABASE_URL, development uses a local SQLite file (.data/spr.db). Tables are
// created on first use.
//
//   GET                                    everything: { days, runs, drinks, plan, settings }
//   POST   { type: run|drink, ... }        log a run or drinks
//   PUT    { type: day|plan|setting, ... } create or replace the row with that key
//   DELETE ?type=run|drink&id=...          remove a logged run or drinks
import { createClient } from '@libsql/client'
import { randomUUID } from 'crypto'
import { mkdirSync } from 'fs'

// Run next to the database (Turso in Frankfurt) rather than Vercel's default US region.
export const config = { regions: ['fra1'] }

const BOOLEANS = ['meal1', 'snack1', 'meal2', 'snack2', 'meal3', 'snack3', 'abs', 'challenge']
const SETTINGS = { start: 'date', length: 'number' }
const DATE = /^\d{4}-\d{2}-\d{2}$/

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS days (
    date TEXT PRIMARY KEY,
    ${BOOLEANS.map(col => `${col} INTEGER NOT NULL DEFAULT 0`).join(',\n    ')},
    notes TEXT NOT NULL DEFAULT '',
    water REAL NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    km REAL NOT NULL,
    time TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS drinks (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    quantity REAL NOT NULL,
    drink TEXT NOT NULL DEFAULT 'Beer',
    notes TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS plan (
    week INTEGER PRIMARY KEY,
    abs TEXT NOT NULL DEFAULT '',
    challenge TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
]

const TABLES = { day: 'days', run: 'runs', drink: 'drinks', plan: 'plan', setting: 'settings' }
const KEYS = { day: 'date', run: 'id', drink: 'id', plan: 'week', setting: 'key' }

let db = null
let ready = null

function database() {
  if (db) return db
  let url = process.env.TURSO_DATABASE_URL
  if (!url) {
    if (process.env.NODE_ENV === 'production') throw new Error('TURSO_DATABASE_URL is not set')
    mkdirSync('.data', { recursive: true })
    url = 'file:.data/spr.db'
  }
  db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  return db
}

// Once per server instance; retried on the next request if it fails.
function migrate() {
  ready ??= database().batch(SCHEMA, 'write').catch(err => { ready = null; throw err })
  return ready
}

const query = async (statement) => (await database().execute(statement)).rows

// Request body -> [sql, args] to run, or an error message.
function statementFor(type, body) {
  const text = (v, max = 2000) => String(v ?? '').slice(0, max)
  const number = (v, min, max) => {
    const n = Number(String(v ?? '').replace(',', '.'))
    return v !== '' && v !== null && Number.isFinite(n) && n >= min && n <= max ? n : null
  }
  const date = DATE.test(body.date) ? body.date : null

  switch (type) {
    case 'day': {
      if (!date) return 'A valid date is required'
      const cols = ['date', ...BOOLEANS, 'notes', 'water']
      return [`INSERT INTO days (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
        ON CONFLICT (date) DO UPDATE SET ${cols.slice(1).map(col => `${col} = excluded.${col}`).join(', ')}`,
        [date, ...BOOLEANS.map(col => body[col] ? 1 : 0), text(body.notes), number(body.water, 0, 20) ?? 0]]
    }
    case 'run': {
      const km = number(body.km, 0.01, 500)
      if (!date || km === null) return 'Date and km are required'
      return ['INSERT INTO runs (id, date, km, time, notes) VALUES (?, ?, ?, ?, ?)',
        [randomUUID(), date, km, text(body.time, 20), text(body.notes, 500)]]
    }
    case 'drink': {
      const quantity = number(body.quantity, 0.1, 100)
      if (!date || quantity === null) return 'Date and quantity are required'
      return ['INSERT INTO drinks (id, date, quantity, drink, notes) VALUES (?, ?, ?, ?, ?)',
        [randomUUID(), date, quantity, text(body.drink, 50).trim() || 'Beer', text(body.notes, 500)]]
    }
    case 'plan': {
      const week = number(body.week, 1, 52)
      if (!Number.isInteger(week)) return 'A valid week is required'
      return [`INSERT INTO plan (week, abs, challenge) VALUES (?, ?, ?)
        ON CONFLICT (week) DO UPDATE SET abs = excluded.abs, challenge = excluded.challenge`,
        [week, text(body.abs), text(body.challenge)]]
    }
    case 'setting': {
      const kind = SETTINGS[body.key]
      if (!kind) return 'Unknown setting'
      const value = kind === 'date' ? (DATE.test(body.value) ? body.value : null) : number(body.value, 1, 365)
      if (value === null) return `Invalid ${body.key}`
      return ['INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
        [body.key, String(value)]]
    }
  }
  return 'Unknown type'
}

// SQLite stores the tick boxes as 0/1.
const toDay = (row) => ({ ...row, ...Object.fromEntries(BOOLEANS.map(col => [col, !!row[col]])) })
const plain = (row) => ({ ...row })

export default async function handler(req, res) {
  const key = process.env.SPR_KEY
  if (key ? req.headers['x-spr-key'] !== key : process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
  }

  try {
    await migrate()

    if (req.method === 'GET') {
      const [days, runs, drinks, plan, settings] = await Promise.all([
        query('SELECT * FROM days ORDER BY date'),
        query('SELECT * FROM runs ORDER BY date'),
        query('SELECT * FROM drinks ORDER BY date'),
        query('SELECT * FROM plan ORDER BY week'),
        query('SELECT * FROM settings'),
      ])
      return res.status(200).json({
        days: days.map(toDay),
        runs: runs.map(plain),
        drinks: drinks.map(plain),
        plan: plan.map(plain),
        settings: Object.fromEntries(settings.map(s => [s.key, s.value])),
      })
    }

    const type = req.method === 'DELETE' ? req.query.type : req.body?.type
    const loggable = type === 'run' || type === 'drink'

    if (req.method === 'POST' || req.method === 'PUT') {
      if (!TABLES[type] || (req.method === 'POST') !== loggable) return res.status(400).json({ error: 'Unknown type' })
      const statement = statementFor(type, req.body)
      if (typeof statement === 'string') return res.status(400).json({ error: statement })
      const [sql, args] = statement
      // Write, then read the stored row back (new runs and drinks get their id here).
      const [, { rows: [saved] }] = await database().batch([
        { sql, args },
        { sql: `SELECT * FROM ${TABLES[type]} WHERE ${KEYS[type]} = ?`, args: [args[0]] },
      ], 'write')
      return res.status(200).json(type === 'day' ? toDay(saved) : plain(saved))
    }

    if (req.method === 'DELETE') {
      if (!loggable) return res.status(400).json({ error: 'Unknown type' })
      const { rowsAffected } = await database().execute({ sql: `DELETE FROM ${TABLES[type]} WHERE id = ?`, args: [String(req.query.id)] })
      if (!rowsAffected) return res.status(404).json({ error: 'Entry not found' })
      return res.status(204).end()
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE')
    return res.status(405).end()
  } catch (err) {
    console.error('spr:', err.message)
    return res.status(502).json({ error: 'Database request failed' })
  }
}
