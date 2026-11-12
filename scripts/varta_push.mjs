// Runs on the home network and sends the VARTA battery readings to the public site,
// which can't reach the battery itself (see lib/varta_remote.js).
//
//   npm run varta:push
//
// Reads .env.local: VARTA_HOST (and VARTA_PORT, VARTA_UNIT_ID), VARTA_PUSH_KEY, and optionally
// VARTA_PUSH_URL (default https://jon-williams.dev). Also records history to data/varta,
// unless the Next.js server on this machine is already doing that.

import { getVartaStatus, vartaConfig } from '../lib/varta.js'
import { getHistory, RANGES, startCollector } from '../lib/varta_history.js'

const STATUS_MS = 10000
const HISTORY_MS = 60000
const SITE = (process.env.VARTA_PUSH_URL || 'https://jon-williams.dev').replace(/\/$/, '')
const KEY = process.env.VARTA_PUSH_KEY

if (!vartaConfig() || !KEY) {
    console.error('Set VARTA_HOST and VARTA_PUSH_KEY in .env.local')
    process.exit(1)
}

const log = (...args) => console.log(new Date().toLocaleTimeString('en-GB'), ...args)

// Only logs when something changes, so a long run doesn't fill the terminal.
let lastProblem = null
const problem = (text) => {
    if (text !== lastProblem) log(text ?? 'Back to normal')
    lastProblem = text
}

async function push(body) {
    const res = await fetch(`${SITE}/api/varta/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) throw new Error(`site answered ${res.status} ${(await res.text()).slice(0, 200)}`)
}

async function pushStatus() {
    let status
    try {
        status = await getVartaStatus()
    } catch (err) {
        return problem(`Battery read failed: ${err.message}`)
    }
    try {
        await push({ status })
        problem(null)
    } catch (err) {
        problem(`Push failed: ${err.message}`)
    }
}

async function pushHistory() {
    try {
        const history = {}
        for (const range of Object.keys(RANGES)) history[range] = await getHistory(range)
        await push({ history })
    } catch (err) {
        problem(`History push failed: ${err.message}`)
    }
}

const collecting = startCollector()
log(`Pushing ${vartaConfig().host} to ${SITE} every ${STATUS_MS / 1000} s` +
    (collecting ? ', recording history' : ' (history recorded by another process)'))

lastProblem = undefined
await pushStatus()
await pushHistory()
setInterval(pushStatus, STATUS_MS)
setInterval(pushHistory, HISTORY_MS)
