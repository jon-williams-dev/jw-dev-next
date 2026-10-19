// VARTA element battery, read over Modbus TCP on the home network.
//
// Register map: Varta "Modbus TCP documentation" v13.4, cross-checked against
// community configs and live readings from our element 6 kWh (2026-10-19).
// Only registers whose meaning has been confirmed are read. See docs/varta.md.

import { readHoldingRegisters, registers } from './modbus'

const IDLE_W = 15   // below this, grid flow counts as balanced
const INFO_TTL = 10 * 60 * 1000

// Live values, read every poll. The block must only contain valid addresses.
const LIVE_FIRST = 1052
const LIVE_LAST = 1081

const REG = {
    clock: 1052,          // uint32 Unix seconds (low word first), battery's clock
    modules: 1064,        // uint16, installed battery modules
    state: 1065,          // uint16, see STATES
    power: 1066,          // int16 W, + charging / − discharging
    apparentPower: 1067,  // int16 VA, same sign as power
    soc: 1068,            // uint16 %
    chargedTotal: 1069,   // uint32 Wh (low word first), lifetime energy charged
    capacity: 1071,       // uint16 × 10 Wh, usable capacity
    maxDischarge: 1074,   // int16 W, configured discharge limit (negative), read only
    maxCharge: 1075,      // int16 W, configured charge limit, read only
    gridPower: 1078,      // int16 W at the house connection, + import / − export
}

// Static device info: one character per register, zero-padded.
const INFO_FIRST = 1000
const INFO = {
    emsVersion: [1000, 17],
    ensVersion: [1017, 17],
    softwareVersion: [1034, 17],
    tableVersion: [1051, 1],
}

export const STATES = {
    0: 'Busy',
    1: 'Run',
    2: 'Charging',
    3: 'Discharging',
    4: 'Standby',
    5: 'Error',
    6: 'Service',
    7: 'Islanding',
}

export const vartaConfig = () => process.env.VARTA_HOST
    ? {
        host: process.env.VARTA_HOST,
        port: Number(process.env.VARTA_PORT) || 502,
        unitId: Number(process.env.VARTA_UNIT_ID) || 255,
    }
    : null

const check = (name, value, min, max) => {
    if (!Number.isFinite(value) || value < min || value > max) {
        throw new Error(`implausible ${name}: ${value}`)
    }
    return value
}

const registerString = (buf, offset, count) => {
    let s = ''
    for (let i = 0; i < count; i++) {
        const code = buf.readUInt16BE((offset + i) * 2)
        if (!code) break
        s += String.fromCharCode(code)
    }
    return s.trim()
}

// The battery's web interface publishes a few identifiers without a login.
async function readWebInfo(host) {
    try {
        const res = await fetch(`http://${host}/cgi/info.js`, { signal: AbortSignal.timeout(3000) })
        if (!res.ok) return {}
        const text = await res.text()
        const field = (name) => text.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`))?.[1] || null
        return { energyMeterSerial: field('Serial_EMeter') }
    } catch {
        return {}
    }
}

let infoCache = null   // { value, expires }

async function readDeviceInfo(config, serial) {
    if (infoCache && infoCache.expires > Date.now()) return infoCache.value
    const buf = await readHoldingRegisters({ ...config, address: INFO_FIRST, count: 52 })
    const value = {
        model: 'VARTA element',
        serial,
        emsVersion: registerString(buf, INFO.emsVersion[0] - INFO_FIRST, INFO.emsVersion[1]),
        ensVersion: registerString(buf, INFO.ensVersion[0] - INFO_FIRST, INFO.ensVersion[1]),
        softwareVersion: registerString(buf, INFO.softwareVersion[0] - INFO_FIRST, INFO.softwareVersion[1]),
        tableVersion: buf.readUInt16BE((INFO.tableVersion[0] - INFO_FIRST) * 2),
        ...(await readWebInfo(config.host)),
    }
    infoCache = { value, expires: Date.now() + INFO_TTL }
    return value
}

export async function readVarta(config) {
    const buf = await readHoldingRegisters({ ...config, address: LIVE_FIRST, count: LIVE_LAST - LIVE_FIRST + 1 })
    const r = registers(buf, LIVE_FIRST)

    const state = r.uint16(REG.state)
    const gridPower = check('grid power', r.int16(REG.gridPower), -30000, 30000)
    const clock = r.uint32(REG.clock, true) * 1000
    const serial = registerString(buf, 1054 - LIVE_FIRST, 10)

    return {
        battery: {
            charge: check('state of charge', r.uint16(REG.soc), 0, 100),
            power: check('battery power', r.int16(REG.power), -20000, 20000),
            apparentPower: r.int16(REG.apparentPower),
            status: state,
            statusLabel: STATES[state] || 'Unknown',
            capacityWh: check('capacity', r.uint16(REG.capacity) * 10, 1000, 100000),
            chargedTotalWh: r.uint32(REG.chargedTotal, true),
            modules: r.uint16(REG.modules),
            maxChargeW: r.int16(REG.maxCharge),
            maxDischargeW: Math.abs(r.int16(REG.maxDischarge)),
        },
        grid: {
            power: gridPower,
            // Sign checked against the Varta app on 2026-10-19 (Netzeinspeisung 2 W ↔ raw −3 W).
            direction: Math.abs(gridPower) < IDLE_W ? 'idle' : gridPower > 0 ? 'import' : 'export',
        },
        device: {
            ...(await readDeviceInfo(config, serial)),
            // Matched the web interface's own clock to the second on 2026-10-19.
            clock: new Date(clock).toISOString(),
            clockDriftS: Math.round((clock - Date.now()) / 1000),
        },
    }
}

// Shared, briefly cached reading. Every viewer and the history collector go
// through here, so the battery sees at most one Modbus read per CACHE_TTL.
const CACHE_TTL = 2000
let statusCache = null   // { value, expires }
let inFlight = null

export async function getVartaStatus(config = vartaConfig()) {
    if (statusCache && statusCache.expires > Date.now()) return statusCache.value
    inFlight ||= readVarta(config).finally(() => { inFlight = null })
    const reading = await inFlight
    statusCache = { value: { timestamp: new Date().toISOString(), connected: true, ...reading }, expires: Date.now() + CACHE_TTL }
    return statusCache.value
}
