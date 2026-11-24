// Where /jw-overlap keeps its projects: on the server (pages/api/overlap.js) so every browser sees
// the same ones, with a copy in the browser so it works offline and opens instantly. A key is only
// needed if the server has been locked with OVERLAP_KEY.
//
// The server copy wins when the page opens, with two exceptions: the first time a browser connects,
// projects only it has are added to the server's rather than thrown away (but not the sample a new
// browser starts with); and changes made here while offline are sent up, as long as nobody changed
// the server copy in the meantime. While the page is open it checks the server every so often, so
// every browser shows the same projects.

import { useEffect, useRef, useState } from 'react'
import { STORAGE_KEY, loadState, saveState } from '../lib/overlap'

const API = '/api/overlap'
const KEY_STORAGE = 'jw-overlap:key'
const SYNCED_STORAGE = 'jw-overlap:synced' // server version this browser's copy is based on; empty = never synced
const DIRTY_STORAGE = 'jw-overlap:dirty' // '1' while this browser has changes the server hasn't got
const SAVE_DELAY_MS = 700
const POLL_MS = 20 * 1000

const read = (name) => { try { return localStorage.getItem(name) || '' } catch { return '' } }
const write = (name, value) => { try { if (value) localStorage.setItem(name, value); else localStorage.removeItem(name) } catch { } }

// The key from ?key= (remembered, then taken out of the address bar) or from an earlier visit.
function takeKey() {
    const url = new URL(window.location.href)
    const fromUrl = url.searchParams.get('key')
    if (fromUrl) {
        write(KEY_STORAGE, fromUrl.trim())
        url.searchParams.delete('key')
        window.history.replaceState(window.history.state, '', url)
    }
    return read(KEY_STORAGE)
}

// Projects only this browser has, added after the server's. The sample stays behind.
function merge(server, local) {
    const known = new Set(server.projects.map((p) => p.id))
    return { projects: [...server.projects, ...local.projects.filter((p) => !known.has(p.id) && p.id !== 'sample')], currentId: server.currentId || local.currentId }
}

// status: 'loading' | 'local' (server locked, no key) | 'saving' | 'saved' | 'offline' | 'badkey'
export function useOverlapStore() {
    const [state, setStateRaw] = useState(null)
    const [sync, setSync] = useState({ status: 'loading', updated: null, message: null })
    const [stored, setStored] = useState(true) // whether the browser copy could be written
    const key = useRef('')
    const version = useRef(0)
    const serverCopy = useRef(null) // the state last loaded from or saved to the server: no need to send it back
    const timer = useRef(null)
    const pushing = useRef(false)
    const latest = useRef(null)
    const loaded = useRef(null) // the browser's copy as it was loaded: showing it isn't a change to save

    const request = (method, body) => fetch(API, {
        method,
        headers: { 'Content-Type': 'application/json', ...(key.current ? { 'x-overlap-key': key.current } : {}) },
        body: body && JSON.stringify(body),
        keepalive: method === 'PUT', // lets a save started as the tab closes finish
        cache: 'no-store',
    })

    const synced = (data, v) => {
        version.current = v
        serverCopy.current = data
        write(SYNCED_STORAGE, String(v))
        if (latest.current === data) write(DIRTY_STORAGE, '')
    }

    const fromServer = (data, v, updated, message = null) => {
        latest.current = data
        synced(data, v)
        setStateRaw(data)
        setSync({ status: 'saved', updated, message })
    }

    const push = async () => {
        clearTimeout(timer.current)
        timer.current = null
        const data = latest.current
        if (!data || data === serverCopy.current) return
        setSync((s) => ({ ...s, status: 'saving' }))
        pushing.current = true
        try {
            const res = await request('PUT', { data, version: version.current })
            const body = await res.json().catch(() => ({}))
            if (res.status === 409) return fromServer(body.data, body.version, body.updated, 'Changed on another device, so the latest copy was loaded.')
            if (res.status === 401) return setSync({ status: 'badkey', updated: null, message: body.error })
            if (!res.ok) throw new Error(body.error)
            synced(data, body.version)
            // Only "saved" if nothing changed while this was on its way.
            setSync({ status: latest.current === data ? 'saved' : 'saving', updated: body.updated, message: null })
        } catch {
            setSync((s) => ({ ...s, status: 'offline', message: 'Couldn’t reach the server: saved in this browser for now.' }))
        } finally {
            pushing.current = false
        }
    }

    // Load the server copy (or fall back to the browser's) and settle who's right.
    const connect = async () => {
        const local = latest.current
        // A browser's own copy shows only once it's clear the server's can't be had.
        const showLocal = () => setStateRaw((s) => s || (loaded.current = latest.current))
        try {
            const res = await request('GET')
            const body = await res.json().catch(() => ({}))
            if (res.status === 401) {
                showLocal()
                return setSync({ status: key.current ? 'badkey' : 'local', updated: null, message: key.current ? body.error : null })
            }
            if (!res.ok) throw new Error(body.error)
            if (!body.data) { // nothing on the server yet: this browser's projects become the first copy
                version.current = 0
                showLocal()
                return push()
            }
            const base = Number(read(SYNCED_STORAGE)) || 0
            const dirty = read(DIRTY_STORAGE) === '1'
            if (base && !dirty && body.version === version.current && serverCopy.current) { // nothing new
                return setSync((s) => (s.status === 'offline' ? { status: 'saved', updated: body.updated, message: null } : s))
            }
            if (base && dirty && body.version === base) { // changes made here offline, server untouched: send them
                version.current = base
                return push()
            }
            fromServer(body.data, body.version, body.updated, base && dirty ? 'Changed on another device while this one was offline, so the latest copy was loaded.' : null)
            if (!base) {
                const merged = merge(body.data, local)
                if (merged.projects.length > body.data.projects.length) setState(merged)
            }
        } catch {
            showLocal()
            setSync({ status: 'offline', updated: null, message: 'Couldn’t reach the server: showing the copy saved in this browser.' })
        }
    }

    useEffect(() => {
        key.current = takeKey()
        const local = loadState()
        latest.current = local
        // A browser that has never saved anything waits for the server rather than flashing the sample.
        if (read(STORAGE_KEY)) setStateRaw(loaded.current = local)
        connect()
    }, [])

    // Pick up changes made in other browsers while this one is open (not mid-save).
    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible' && !timer.current && !pushing.current) connect()
        }, POLL_MS)
        return () => clearInterval(id)
    }, [])

    // Every change: into the browser straight away, to the server shortly after (in one go if
    // several come quickly, as while using the arrow keys).
    const setState = (next) => {
        setStateRaw((prev) => {
            const value = typeof next === 'function' ? next(prev) : next
            latest.current = value
            return value
        })
    }

    useEffect(() => {
        if (!state) return
        setStored(saveState(state))
        if (state === serverCopy.current || state === loaded.current || !['saved', 'saving', 'offline'].includes(sync.status)) return
        write(DIRTY_STORAGE, '1')
        clearTimeout(timer.current)
        timer.current = setTimeout(push, SAVE_DELAY_MS)
    }, [state])

    // Leaving the tab saves at once; coming back picks up changes made elsewhere, and checks again
    // whether the server takes saves (a tab left open in 'local' would otherwise never find out).
    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') { if (timer.current) push() }
            else if (!timer.current) connect()
        }
        document.addEventListener('visibilitychange', onVisibility)
        return () => document.removeEventListener('visibilitychange', onVisibility)
    })

    const signIn = (newKey) => {
        key.current = newKey.trim()
        write(KEY_STORAGE, key.current)
        setSync({ status: 'loading', updated: null, message: null })
        connect()
    }

    return { state, setState, sync, stored, signIn, retry: connect }
}
