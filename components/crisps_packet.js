// A bag of crisps for /should/crisps: there is no crisps emoji, and the kiosk has no emoji font.
export default function CrispsPacket(props) {
    return (
        <svg viewBox="0 0 120 140" aria-hidden="true" {...props}>
            <defs>
                <linearGradient id="crisps-bag" x1="0" x2="1">
                    <stop offset="0" stopColor="#e8a400" />
                    <stop offset="0.45" stopColor="#ffd23f" />
                    <stop offset="1" stopColor="#e09a00" />
                </linearGradient>
            </defs>
            {/* The bag, puffed out in the middle, with crimped ends */}
            <path d="M18 18h84c-4 16-2 34 3 52s3 38-3 52H18c-6-14-8-34-3-52s7-36 3-52z" fill="url(#crisps-bag)" />
            <path d="M16 12h88v10H16zM16 118h88v10H16z" fill="#c8102e" />
            <path d="M16 12l4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4M16 128l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4" fill="none" stroke="#8f0a20" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Label */}
            <rect x="30" y="34" width="60" height="22" rx="11" fill="#c8102e" />
            <text x="60" y="50" textAnchor="middle" fill="#fff" fontFamily="inherit" fontSize="14" fontWeight="900" letterSpacing="1">CRISPS</text>
            {/* Crisps on the front */}
            <g stroke="#b57400" strokeWidth="1.5">
                <path d="M34 84c6-10 22-12 28-2-2 10-20 14-28 2z" fill="#ffe680" />
                <path d="M58 92c4-12 24-14 30-4-4 12-24 14-30 4z" fill="#fff0a8" />
                <path d="M42 102c6-6 18-6 22 2-4 8-18 8-22-2z" fill="#ffe27a" />
            </g>
            <path d="M24 30c-2 20 2 40 4 60" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
}
