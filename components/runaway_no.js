import { useEffect, useRef, useState } from 'react'

const FLEE_RADIUS = 110 // px between the pointer and the button before it runs
const MARGIN = 16

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// A No button that can't be pressed: it jumps somewhere random in the viewport whenever the
// pointer gets close, and on a tap for touch screens. Remount it to put it back in its place.
export default function RunawayNo({ className, taunts, onDodge }) {
    const ref = useRef(null)
    const [pos, setPos] = useState(null) // null until the first dodge; then fixed to the viewport
    const [taunt, setTaunt] = useState('No')

    // Jump somewhere random in the viewport, well away from the pointer.
    const flee = (px, py) => {
        const button = ref.current
        if (!button) return
        const { width, height } = button.getBoundingClientRect()
        const maxX = window.innerWidth - width - MARGIN
        const maxY = window.innerHeight - height - MARGIN
        let x, y
        for (let i = 0; i < 20; i++) {
            x = MARGIN + Math.random() * (maxX - MARGIN)
            y = MARGIN + Math.random() * (maxY - MARGIN)
            if (Math.hypot(x + width / 2 - px, y + height / 2 - py) > FLEE_RADIUS * 2) break
        }
        setPos({ x, y })
        setTaunt(pick(taunts))
        onDodge?.()
    }

    useEffect(() => {
        const onMove = (e) => {
            const rect = ref.current?.getBoundingClientRect()
            if (!rect) return
            const nearestX = Math.max(rect.left, Math.min(e.clientX, rect.right))
            const nearestY = Math.max(rect.top, Math.min(e.clientY, rect.bottom))
            if (Math.hypot(e.clientX - nearestX, e.clientY - nearestY) < FLEE_RADIUS) flee(e.clientX, e.clientY)
        }
        window.addEventListener('pointermove', onMove)
        return () => window.removeEventListener('pointermove', onMove)
    })

    // Touch screens have no hover, so a tap makes it run instead.
    const onPointerDown = (e) => {
        e.preventDefault()
        flee(e.clientX, e.clientY)
    }

    // A tap also fires a click after the pointerdown, which has already dodged. Only a click from
    // the keyboard (detail 0) still needs to.
    const onClick = (e) => {
        e.preventDefault()
        if (e.detail !== 0) return
        const rect = ref.current.getBoundingClientRect()
        flee(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }

    return (
        <button
            ref={ref}
            className={className}
            style={pos ? { position: 'fixed', left: pos.x, top: pos.y } : undefined}
            onPointerDown={onPointerDown}
            onClick={onClick}
        >
            {taunt}
        </button>
    )
}
