// Inline SVG so the kiosk has no icon-font/network dependency.

export function CalendarIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2" />
    </svg>
  )
}

export function SchoolIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M8 6V4.5A2.5 2.5 0 0 1 10.5 2h3A2.5 2.5 0 0 1 16 4.5V6" />
      <rect x="4" y="6" width="16" height="15.5" rx="3.5" />
      <path d="M4 12.5h16" />
      <rect x="9.5" y="11" width="5" height="3.5" rx="1" />
      <path d="M7.5 21.5v-3M16.5 21.5v-3" />
    </svg>
  )
}

export function SunbankIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M9 1.5v1.3M9 13.2v1.3M2.5 8h1.3M14.2 8h1.3M4.4 3.4l.9.9M12.7 11.7l.9.9M4.4 12.6l.9-.9M12.7 4.3l.9-.9" />
      <rect x="13" y="12.5" width="8.5" height="10" rx="1.6" />
      <path d="M15.5 11.2h3.5" />
      <path d="M17.6 14.6l-1.8 3h2.4l-1.8 3" />
    </svg>
  )
}
