// 90-day fitness plan for /spr, stored in Turso (hosted SQLite / libSQL).
//
//   TURSO_DATABASE_URL="libsql://spr-you.turso.io"  added by Vercel's Turso integration
//   TURSO_AUTH_TOKEN="..."
//   SPR_KEY="some-long-random-string"  the owner's key (user 1, who can add people)
//
// Without TURSO_DATABASE_URL, development uses a local SQLite file (.data/spr.db). Tables are
// created on first use.
//
// Everyone signs in with a personal key (x-spr-key header); the page picks it up once from
// /spr?key=... and remembers it. The owner adds people and hands out their links. Keys are
// looked up by hash, and also kept encrypted with a secret derived from SPR_KEY so the owner
// can see a person's link again. All data belongs to one person and nobody sees anyone
// else's, except waves the owner marks official.
//
// Official waves are how plans reach people: everyone else starts a wave by copying an
// official one, and can change its name and dates but not its plan. The owner can also keep
// draft waves to write plans in.
//
// A wave is a block of days (90 by default) with its own weekly plan. Days, runs and drinks are
// stored by date and belong to whichever of the person's waves covers that date; a person's
// waves never overlap. The daily checklist (meals, water, coffee, abs or challenge, notes)
// can only be saved inside an official wave: one marked official, or a copy of one. Runs and
// drinks can be logged on any date; outside a wave they're just history.
//
//   GET                                          everything for the signed-in person
//   POST   { type: run|drink|wave|person, ... }  log a run or drinks, start a wave (copyFrom:
//                                                an official wave, or for the owner any of
//                                                theirs), or add a person (owner only)
//   PUT    { type: day|plan|wave|me|person, ... } save a day or a week's plan, change a wave,
//                                                your name, or a person (owner: name, and a
//                                                new code: newKey for a random one, or key)
//   DELETE ?type=run|drink|wave|person&id=...    remove one (a person takes all their data)
import { createClient } from '@libsql/client'
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'crypto'
import { mkdirSync } from 'fs'

// Run next to the database (Turso in Frankfurt) rather than Vercel's default US region.
export const config = { regions: ['fra1'] }

const OWNER = 1
const BOOLEANS = ['meal1', 'snack1', 'meal2', 'snack2', 'meal3', 'snack3', 'abs', 'challenge']
const DAY_COLUMNS = ['date', ...BOOLEANS, 'notes', 'water', 'coffee']
const DATE = /^\d{4}-\d{2}-\d{2}$/
const DEFAULT_LENGTH = 90

const DAYS_TABLE = (name) => `CREATE TABLE IF NOT EXISTS ${name} (
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    ${BOOLEANS.map(col => `${col} INTEGER NOT NULL DEFAULT 0`).join(',\n    ')},
    notes TEXT NOT NULL DEFAULT '',
    water REAL NOT NULL DEFAULT 0,
    coffee INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, date)
  )`

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_sealed TEXT,
    created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TEXT
  )`,
  // The owner signs in with SPR_KEY, so their stored hash is a placeholder no key can match.
  `INSERT OR IGNORE INTO users (id, name, key_hash) VALUES (${OWNER}, 'Me', 'owner:SPR_KEY')`,
  DAYS_TABLE('days'),
  `CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    km REAL NOT NULL,
    time TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS drinks (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    quantity REAL NOT NULL,
    drink TEXT NOT NULL DEFAULT 'Beer',
    notes TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS waves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start TEXT NOT NULL,
    -- Not "length": libSQL rows are array-like, so a length column would be hidden.
    num_days INTEGER NOT NULL DEFAULT ${DEFAULT_LENGTH},
    -- Set by the owner: everyone can copy an official wave's plan.
    official INTEGER NOT NULL DEFAULT 0,
    -- The official wave this one was copied from, if any.
    based_on INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS wave_plan (
    wave_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    abs TEXT NOT NULL DEFAULT '',
    challenge TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (wave_id, week)
  )`,
  // Before waves there was one plan, with its start date and length in settings. Both tables
  // stay so the step below can turn them into the owner's Wave 1.
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

// Columns added after the first release. Tables created earlier get them on the next start;
// rows from before there were people belong to the owner.
const ADDED_COLUMNS = {
  users: { key_sealed: 'TEXT', last_seen: 'TEXT' },
  days: { coffee: 'INTEGER NOT NULL DEFAULT 0' },
  runs: { user_id: `INTEGER NOT NULL DEFAULT ${OWNER}` },
  drinks: { user_id: `INTEGER NOT NULL DEFAULT ${OWNER}` },
  waves: { user_id: `INTEGER NOT NULL DEFAULT ${OWNER}`, official: 'INTEGER NOT NULL DEFAULT 0', based_on: 'INTEGER' },
}

// The single plan from before waves becomes the owner's Wave 1, once.
const TO_WAVES = [
  `INSERT INTO waves (id, user_id, name, start, num_days)
    SELECT 1, ${OWNER}, 'Wave 1',
      COALESCE((SELECT value FROM settings WHERE key = 'start'), date('now')),
      COALESCE((SELECT CAST(value AS INTEGER) FROM settings WHERE key = 'length'), ${DEFAULT_LENGTH})
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'waves_migrated')
      AND NOT EXISTS (SELECT 1 FROM waves)
      AND (EXISTS (SELECT 1 FROM settings WHERE key = 'start') OR EXISTS (SELECT 1 FROM plan))`,
  `INSERT OR IGNORE INTO wave_plan (wave_id, week, abs, challenge)
    SELECT 1, week, abs, challenge FROM plan
    WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'waves_migrated')
      AND EXISTS (SELECT 1 FROM waves WHERE id = 1)`,
  `INSERT OR IGNORE INTO settings (key, value) VALUES ('waves_migrated', '1')`,
]

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

const columnsOf = async (client, table) => new Set((await client.execute(`PRAGMA table_info(${table})`)).rows.map(r => r.name))

// days was keyed by date alone before there were people. SQLite can't change a primary key,
// so the table is rebuilt with its rows going to the owner. Checked inside the write
// transaction, so it happens once even if several server instances start together.
async function daysPerPerson() {
  const tx = await database().transaction('write')
  try {
    if (!(await columnsOf(tx, 'days')).has('user_id')) {
      await tx.execute('DROP TABLE IF EXISTS days_by_person')
      await tx.execute(DAYS_TABLE('days_by_person'))
      await tx.execute(`INSERT INTO days_by_person (user_id, ${DAY_COLUMNS.join(', ')})
        SELECT ${OWNER}, ${DAY_COLUMNS.join(', ')} FROM days`)
      await tx.execute('DROP TABLE days')
      await tx.execute('ALTER TABLE days_by_person RENAME TO days')
    }
    await tx.commit()
  } finally {
    tx.close()
  }
}

async function addMissingColumns() {
  for (const [table, columns] of Object.entries(ADDED_COLUMNS)) {
    const existing = await columnsOf(database(), table)
    for (const [column, definition] of Object.entries(columns)) {
      if (!existing.has(column)) await database().execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
    }
  }
}

// Once per server instance; retried on the next request if it fails.
function migrate() {
  ready ??= database().batch(SCHEMA, 'write')
    .then(addMissingColumns) // before rebuilding days, which copies the coffee column
    .then(daysPerPerson)
    .then(() => database().batch(TO_WAVES, 'write'))
    .catch(err => { ready = null; throw err })
  return ready
}

const query = async (statement) => (await database().execute(statement)).rows

const text = (v, max = 2000) => String(v ?? '').slice(0, max)
const number = (v, min, max) => {
  const n = Number(String(v ?? '').replace(',', '.'))
  return v !== '' && v !== null && Number.isFinite(n) && n >= min && n <= max ? n : null
}
const id = (v) => number(v, 1, Number.MAX_SAFE_INTEGER)
const addDays = (date, n) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)
const pretty = (date) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })
const hashKey = (key) => createHash('sha256').update(key).digest('hex')
const newKey = () => randomBytes(24).toString('base64url')
const KEY_FORMAT = /^[A-Za-z0-9_-]{8,64}$/

// Keys kept for the owner to see again, encrypted with AES-256-GCM. If SPR_KEY changes they
// can't be read any more (the links still work); a new code fixes that.
const sealingKey = () => createHash('sha256').update(`spr-links:${process.env.SPR_KEY || 'dev'}`).digest()
function seal(key) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', sealingKey(), iv)
  const data = Buffer.concat([cipher.update(key, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map(b => b.toString('base64url')).join('.')
}
function unseal(sealed) {
  try {
    const [iv, tag, data] = sealed.split('.').map(part => Buffer.from(part, 'base64url'))
    const decipher = createDecipheriv('aes-256-gcm', sealingKey(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

// SQLite stores the tick boxes as 0/1.
const toDay = ({ user_id, ...row }) => ({ ...row, ...Object.fromEntries(BOOLEANS.map(col => [col, !!row[col]])) })
const toEntry = ({ user_id, ...row }) => ({ ...row })
const toWave = (row) => ({ id: row.id, name: row.name, start: row.start, length: row.num_days, official: !!row.official, basedOn: row.based_on ?? null })
const toPerson = (row) => ({ id: row.id, name: row.name, owner: row.id === OWNER, created: row.created })

// The owner's view of everyone: their code (null if it can't be read), activity and wave.
const PEOPLE_SQL = `SELECT u.*,
    (SELECT COUNT(*) FROM days d WHERE d.user_id = u.id) AS days_logged,
    (SELECT MAX(date) FROM days d WHERE d.user_id = u.id) AS last_logged,
    (SELECT COUNT(*) FROM waves w WHERE w.user_id = u.id) AS wave_count,
    (SELECT name FROM waves w WHERE w.user_id = u.id AND w.start <= date('now')
      AND date(w.start, '+' || w.num_days || ' days') > date('now')) AS current_wave
  FROM users u`
const toAdminPerson = (row) => ({
  ...toPerson(row),
  key: row.id === OWNER ? process.env.SPR_KEY || null : row.key_sealed ? unseal(row.key_sealed) : null,
  lastSeen: row.last_seen,
  daysLogged: row.days_logged,
  lastLogged: row.last_logged,
  waveCount: row.wave_count,
  currentWave: row.current_wave,
})
const adminPeople = async (personId = null) => (await query(personId
  ? { sql: `${PEOPLE_SQL} WHERE u.id = ?`, args: [personId] }
  : `${PEOPLE_SQL} ORDER BY u.id`)).map(toAdminPerson)

// A code someone chose, or an error message. Codes are unique (key_hash), and none can be
// the owner's.
function chosenKey(key) {
  if (!KEY_FORMAT.test(key)) return 'A code needs 8 to 64 letters, numbers, - or _'
  if (key === process.env.SPR_KEY) return 'That code is taken'
  return null
}

// The signed-in person, or null.
async function signedIn(req) {
  const key = String(req.headers['x-spr-key'] || '')
  if (!key) return null
  const ownerKey = process.env.SPR_KEY
  if (ownerKey ? key === ownerKey : process.env.NODE_ENV !== 'production' && key === 'dev') {
    return toPerson((await query({ sql: 'SELECT * FROM users WHERE id = ?', args: [OWNER] }))[0])
  }
  const [row] = await query({ sql: 'SELECT * FROM users WHERE key_hash = ?', args: [hashKey(key)] })
  return row ? toPerson(row) : null
}

// Wave fields from a request, or an error message. A person's waves can't overlap, so every
// date belongs to at most one of them.
async function waveFields(userId, body, waveId = null) {
  const start = DATE.test(body.start) ? body.start : null
  const length = number(body.length ?? DEFAULT_LENGTH, 1, 365)
  if (!start || !Number.isInteger(length)) return 'A start date and a length of 1 to 365 days are required'
  const end = addDays(start, length)
  const others = (await query({ sql: 'SELECT * FROM waves WHERE user_id = ? AND id IS NOT ?', args: [userId, waveId] })).map(toWave)
  const clash = others.find(w => w.start < end && start < addDays(w.start, w.length))
  if (clash) return `Those dates overlap ${clash.name} (${pretty(clash.start)} – ${pretty(addDays(clash.start, clash.length - 1))})`
  const name = text(body.name, 40).trim() || `Wave ${others.length + 1}`
  return { name, start, length }
}

// Whether a date is inside one of the person's official waves (marked official, or a copy of one).
const inOfficialWave = async (userId, date) => (await query({
  sql: `SELECT 1 FROM waves WHERE user_id = ? AND (official = 1 OR based_on IS NOT NULL)
    AND start <= ? AND date(start, '+' || num_days || ' days') > ?`,
  args: [userId, date, date],
})).length > 0

const ownWave = async (userId, waveId) =>
  (await query({ sql: 'SELECT 1 FROM waves WHERE id = ? AND user_id = ?', args: [waveId, userId] })).length > 0

// Request body -> [sql, args] for a day, run or drink, or an error message.
function statementFor(userId, type, body) {
  const date = DATE.test(body.date) ? body.date : null

  switch (type) {
    case 'day': {
      if (!date) return 'A valid date is required'
      const cols = ['user_id', ...DAY_COLUMNS]
      return [`INSERT INTO days (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})
        ON CONFLICT (user_id, date) DO UPDATE SET ${DAY_COLUMNS.slice(1).map(col => `${col} = excluded.${col}`).join(', ')}`,
        [userId, date, ...BOOLEANS.map(col => body[col] ? 1 : 0), text(body.notes), number(body.water, 0, 20) ?? 0,
          Math.round(number(body.coffee, 0, 50) ?? 0)]]
    }
    case 'run': {
      const km = number(body.km, 0.01, 500)
      if (!date || km === null) return 'Date and km are required'
      return ['INSERT INTO runs (id, user_id, date, km, time, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [randomUUID(), userId, date, km, text(body.time, 20), text(body.notes, 500)]]
    }
    case 'drink': {
      const quantity = number(body.quantity, 0.1, 100)
      if (!date || quantity === null) return 'Date and quantity are required'
      return ['INSERT INTO drinks (id, user_id, date, quantity, drink, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [randomUUID(), userId, date, quantity, text(body.drink, 50).trim() || 'Beer', text(body.notes, 500)]]
    }
  }
  return 'Unknown type'
}

async function everything(me) {
  const own = { sql: '', args: [me.id] }
  const [days, runs, drinks, waves, plan, library, people] = await Promise.all([
    query({ ...own, sql: 'SELECT * FROM days WHERE user_id = ? ORDER BY date' }),
    query({ ...own, sql: 'SELECT * FROM runs WHERE user_id = ? ORDER BY date' }),
    query({ ...own, sql: 'SELECT * FROM drinks WHERE user_id = ? ORDER BY date' }),
    query({ ...own, sql: 'SELECT * FROM waves WHERE user_id = ? ORDER BY start' }),
    query({ ...own, sql: 'SELECT p.* FROM wave_plan p JOIN waves w ON w.id = p.wave_id WHERE w.user_id = ? ORDER BY p.wave_id, p.week' }),
    // Official waves someone else made, to copy plans from: names and counts only.
    query({ ...own, sql: `SELECT w.id, w.name, u.name AS owner,
        COUNT(CASE WHEN p.abs != '' OR p.challenge != '' THEN 1 END) AS weeks
      FROM waves w JOIN users u ON u.id = w.user_id LEFT JOIN wave_plan p ON p.wave_id = w.id
      WHERE w.official = 1 AND w.user_id != ?
      GROUP BY w.id ORDER BY w.start DESC` }),
    me.owner ? adminPeople() : [],
  ])
  return {
    me,
    days: days.map(toDay),
    runs: runs.map(toEntry),
    drinks: drinks.map(toEntry),
    waves: waves.map(toWave),
    plan: plan.map(toEntry),
    library: library.map(row => ({ id: row.id, name: row.name, owner: row.owner, weeks: row.weeks })),
    people,
  }
}

export default async function handler(req, res) {
  try {
    await migrate()
    const me = await signedIn(req)
    if (!me) return res.status(401).json({ error: 'Not paired', code: 'unpaired' })

    const type = req.method === 'DELETE' ? req.query.type : req.body?.type
    const body = req.body || {}

    if (req.method === 'GET') {
      // For "last active" in the owner's view; written at most once an hour per person.
      await database().execute({
        sql: "UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ? AND (last_seen IS NULL OR last_seen < datetime('now', '-1 hour'))",
        args: [me.id],
      })
      return res.status(200).json(await everything(me))
    }

    // ---- People ----

    if (type === 'me' && req.method === 'PUT') {
      const name = text(body.name, 40).trim()
      if (!name) return res.status(400).json({ error: 'A name is required' })
      await database().execute({ sql: 'UPDATE users SET name = ? WHERE id = ?', args: [name, me.id] })
      return res.status(200).json({ ...me, name })
    }

    if (type === 'person') {
      if (!me.owner) return res.status(403).json({ error: 'Only the owner can manage people' })

      if (req.method === 'POST') {
        const name = text(body.name, 40).trim()
        if (!name) return res.status(400).json({ error: 'A name is required' })
        const key = newKey()
        const { lastInsertRowid } = await database().execute({
          sql: 'INSERT INTO users (name, key_hash, key_sealed) VALUES (?, ?, ?)',
          args: [name, hashKey(key), seal(key)],
        })
        const [person] = await adminPeople(Number(lastInsertRowid))
        return res.status(200).json({ person })
      }

      const personId = id(req.method === 'DELETE' ? req.query.id : body.id)
      const [row] = await query({ sql: 'SELECT * FROM users WHERE id = ?', args: [personId] })
      if (!row) return res.status(404).json({ error: 'Person not found' })

      if (req.method === 'PUT') {
        const changingKey = body.newKey || body.key !== undefined
        if (personId === OWNER && changingKey) return res.status(400).json({ error: 'Your own code is SPR_KEY; change it on Vercel' })
        const name = text(body.name ?? row.name, 40).trim() || row.name
        const key = body.newKey ? newKey() : body.key !== undefined ? String(body.key).trim() : null
        if (key && !body.newKey) {
          const problem = chosenKey(key)
          if (problem) return res.status(400).json({ error: problem })
        }
        try {
          await database().execute({
            sql: `UPDATE users SET name = ?${key ? ', key_hash = ?, key_sealed = ?' : ''} WHERE id = ?`,
            args: key ? [name, hashKey(key), seal(key), personId] : [name, personId],
          })
        } catch (err) {
          if (/UNIQUE/i.test(err.message)) return res.status(400).json({ error: 'That code is taken' })
          throw err
        }
        const [person] = await adminPeople(personId)
        return res.status(200).json({ person })
      }

      if (req.method === 'DELETE') {
        if (personId === OWNER) return res.status(400).json({ error: "You can't remove yourself" })
        await database().batch([
          { sql: 'DELETE FROM wave_plan WHERE wave_id IN (SELECT id FROM waves WHERE user_id = ?)', args: [personId] },
          ...['waves', 'days', 'runs', 'drinks'].map(table => ({ sql: `DELETE FROM ${table} WHERE user_id = ?`, args: [personId] })),
          { sql: 'DELETE FROM users WHERE id = ?', args: [personId] },
        ], 'write')
        return res.status(204).end()
      }
    }

    // ---- Waves and plans ----

    if (type === 'wave' && (req.method === 'POST' || req.method === 'PUT')) {
      const waveId = req.method === 'PUT' ? id(body.id) : null
      if (req.method === 'PUT' && !(await ownWave(me.id, waveId))) return res.status(404).json({ error: 'Wave not found' })
      const fields = await waveFields(me.id, body, waveId)
      if (typeof fields === 'string') return res.status(400).json({ error: fields })
      const { name, start, length } = fields

      if (req.method === 'PUT') {
        // Only the owner can make a wave official; anyone else's request leaves it as it is.
        const official = me.owner && body.official !== undefined ? (body.official ? 1 : 0) : null
        await database().execute({
          sql: 'UPDATE waves SET name = ?, start = ?, num_days = ?, official = COALESCE(?, official) WHERE id = ?',
          args: [name, start, length, official, waveId],
        })
        const [wave] = await query({ sql: 'SELECT * FROM waves WHERE id = ?', args: [waveId] })
        return res.status(200).json({ wave: toWave(wave) })
      }

      // Everyone but the owner starts from an official wave; the owner can also start blank
      // or from one of their drafts.
      const copyFrom = id(body.copyFrom)
      if (!copyFrom && !me.owner) return res.status(400).json({ error: 'Pick an official wave to start from' })
      const [source] = copyFrom
        ? await query({ sql: 'SELECT * FROM waves WHERE id = ? AND (official = 1 OR user_id = ?)', args: [copyFrom, me.owner ? me.id : -1] })
        : []
      if (copyFrom && !source) return res.status(404).json({ error: "That wave's plan can't be copied" })
      const basedOn = source?.official ? source.id : null
      const tx = await database().transaction('write')
      try {
        const { lastInsertRowid } = await tx.execute({
          sql: 'INSERT INTO waves (user_id, name, start, num_days, based_on) VALUES (?, ?, ?, ?, ?)',
          args: [me.id, name, start, length, basedOn],
        })
        const newId = Number(lastInsertRowid)
        if (copyFrom) {
          await tx.execute({
            sql: 'INSERT INTO wave_plan (wave_id, week, abs, challenge) SELECT ?, week, abs, challenge FROM wave_plan WHERE wave_id = ? AND week <= ?',
            args: [newId, copyFrom, Math.ceil(length / 7)],
          })
        }
        const plan = (await tx.execute({ sql: 'SELECT * FROM wave_plan WHERE wave_id = ? ORDER BY week', args: [newId] })).rows
        await tx.commit()
        return res.status(200).json({ wave: { id: newId, name, start, length, official: false, basedOn }, plan: plan.map(toEntry) })
      } finally {
        tx.close()
      }
    }

    if (type === 'plan' && req.method === 'PUT') {
      if (!me.owner) return res.status(403).json({ error: 'Plans come from official waves and can only be changed by the owner' })
      const waveId = id(body.wave_id)
      const week = number(body.week, 1, 53)
      if (!Number.isInteger(week)) return res.status(400).json({ error: 'A valid week is required' })
      if (!(await ownWave(me.id, waveId))) return res.status(404).json({ error: 'Wave not found' })
      await database().execute({
        sql: `INSERT INTO wave_plan (wave_id, week, abs, challenge) VALUES (?, ?, ?, ?)
          ON CONFLICT (wave_id, week) DO UPDATE SET abs = excluded.abs, challenge = excluded.challenge`,
        args: [waveId, week, text(body.abs), text(body.challenge)],
      })
      return res.status(200).json({ wave_id: waveId, week, abs: text(body.abs), challenge: text(body.challenge) })
    }

    // ---- Days, runs and drinks ----

    const TABLES = { day: 'days', run: 'runs', drink: 'drinks' }
    const loggable = type === 'run' || type === 'drink'

    if (req.method === 'POST' || req.method === 'PUT') {
      if (!TABLES[type] || (req.method === 'POST') !== loggable) return res.status(400).json({ error: 'Unknown type' })
      const statement = statementFor(me.id, type, body)
      if (typeof statement === 'string') return res.status(400).json({ error: statement })
      if (type === 'day' && !(await inOfficialWave(me.id, body.date))) {
        return res.status(400).json({ error: "That date isn't in one of your official waves" })
      }
      const [sql, args] = statement
      // Write, then read the stored row back (new runs and drinks get their id here).
      const [, { rows: [saved] }] = await database().batch([
        { sql, args },
        type === 'day'
          ? { sql: 'SELECT * FROM days WHERE user_id = ? AND date = ?', args: [me.id, args[1]] }
          : { sql: `SELECT * FROM ${TABLES[type]} WHERE id = ?`, args: [args[0]] },
      ], 'write')
      return res.status(200).json(type === 'day' ? toDay(saved) : toEntry(saved))
    }

    if (req.method === 'DELETE') {
      const rowId = String(req.query.id)
      if (type === 'wave') {
        if (!(await ownWave(me.id, rowId))) return res.status(404).json({ error: 'Wave not found' })
        // Only the wave and its plan go; days, runs and drinks are kept by date.
        await database().batch([
          { sql: 'DELETE FROM wave_plan WHERE wave_id = ?', args: [rowId] },
          { sql: 'DELETE FROM waves WHERE id = ?', args: [rowId] },
        ], 'write')
        return res.status(204).end()
      }
      if (!loggable) return res.status(400).json({ error: 'Unknown type' })
      const { rowsAffected } = await database().execute({ sql: `DELETE FROM ${TABLES[type]} WHERE id = ? AND user_id = ?`, args: [rowId, me.id] })
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
