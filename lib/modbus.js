// Minimal, read-only Modbus TCP client.
//
// It only ever sends function 03 (Read Holding Registers), so nothing here can
// change a setting on the device. Used by the Varta dashboard (/varta) and
// ready for the Kostal inverter, which speaks the same protocol.

import net from 'node:net'

const READ_HOLDING_REGISTERS = 0x03

const EXCEPTIONS = {
    1: 'illegal function',
    2: 'illegal data address',
    3: 'illegal data value',
    4: 'device failure',
    6: 'device busy',
    11: 'gateway target did not respond',
}

let transactionId = 0

// Resolves to a Buffer holding `count` registers (2 bytes each, big-endian).
export function readHoldingRegisters({ host, port = 502, unitId = 1, address, count, timeout = 3000 }) {
    if (!(count >= 1 && count <= 125)) throw new RangeError('count must be 1–125')

    return new Promise((resolve, reject) => {
        const id = (transactionId = (transactionId + 1) & 0xffff)
        const request = Buffer.alloc(12)
        request.writeUInt16BE(id, 0)     // transaction id
        request.writeUInt16BE(0, 2)      // protocol id (always 0)
        request.writeUInt16BE(6, 4)      // bytes that follow
        request.writeUInt8(unitId, 6)
        request.writeUInt8(READ_HOLDING_REGISTERS, 7)
        request.writeUInt16BE(address, 8)
        request.writeUInt16BE(count, 10)

        let response = Buffer.alloc(0)
        const socket = net.connect({ host, port })
        const fail = (err) => { socket.destroy(); reject(err) }

        socket.setTimeout(timeout, () => fail(new Error(`no response from ${host}:${port} within ${timeout} ms`)))
        socket.on('connect', () => socket.write(request))
        socket.on('error', fail)
        socket.on('data', (chunk) => {
            response = Buffer.concat([response, chunk])
            if (response.length < 9) return
            if (response.readUInt16BE(0) !== id) return fail(new Error('mismatched Modbus transaction id'))

            const fn = response.readUInt8(7)
            if (fn === (READ_HOLDING_REGISTERS | 0x80)) {
                const code = response.readUInt8(8)
                return fail(new Error(`Modbus exception ${code} (${EXCEPTIONS[code] || 'unknown'})`))
            }
            if (fn !== READ_HOLDING_REGISTERS) return fail(new Error(`unexpected Modbus function ${fn}`))

            const byteCount = response.readUInt8(8)
            if (byteCount !== count * 2) return fail(new Error(`expected ${count * 2} bytes, got ${byteCount}`))
            if (response.length < 9 + byteCount) return

            socket.end()
            resolve(response.subarray(9, 9 + byteCount))
        })
    })
}

// Helpers for reading values out of a register block that starts at `base`.
export const registers = (buf, base) => ({
    uint16: (addr) => buf.readUInt16BE((addr - base) * 2),
    int16: (addr) => buf.readInt16BE((addr - base) * 2),
    // 32-bit values span two registers; devices disagree on which word comes first.
    uint32: (addr, wordSwap = false) => {
        const hi = buf.readUInt16BE((addr - base) * 2 + (wordSwap ? 2 : 0))
        const lo = buf.readUInt16BE((addr - base) * 2 + (wordSwap ? 0 : 2))
        return hi * 0x10000 + lo
    },
    float32: (addr, wordSwap = false) => {
        const b = Buffer.alloc(4)
        b.writeUInt16BE(buf.readUInt16BE((addr - base) * 2 + (wordSwap ? 2 : 0)), 0)
        b.writeUInt16BE(buf.readUInt16BE((addr - base) * 2 + (wordSwap ? 0 : 2)), 2)
        return b.readFloatBE(0)
    },
})
