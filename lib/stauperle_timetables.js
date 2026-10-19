// School timetables for the Stauperle 13 hallway kiosk (/stauperle13/school).
//
// One entry per child:
//   name        – shown on the tab
//   periods     – lesson times, [start, end] in 24h "HH:MM"
//   days        – lessons per weekday, one per period (same order as `periods`).
//                 null = free period; a short row = early finish.
//                 A lesson is a subject string, or { subject, note } for a small extra line (e.g. a teacher).
//   activities  – optional after-school clubs per weekday, as [time, name]
//
// Subjects get a consistent colour automatically; add one to SUBJECT_COLORS to pick it yourself.

const GYM_PERIODS = [
  ['07:45', '08:30'],
  ['08:30', '09:15'],
  ['09:35', '10:20'],
  ['10:20', '11:05'],
  ['11:25', '12:10'],
  ['12:10', '12:50'],
  ['14:15', '15:00'],
  ['15:05', '15:50'],
]

export const TIMETABLES = [
  {
    name: 'Flynn',
    periods: GYM_PERIODS,
    days: {
      mon: ['Englisch', 'Englisch', 'Biologie', 'Mathe', 'Deutsch'],
      tue: ['Mathe', 'Mathe', 'Englisch', 'Physik', 'Latein', 'Latein'],
      wed: ['Mathe', 'Physik', 'Musik', 'Musik', 'Geschichte', 'Geschichte'],
      thu: ['Deutsch', 'Deutsch', 'Sport', 'Sport', 'Informatik', 'Informatik', 'Geografie', 'Geografie'],
      fri: ['Latein', 'Latein', 'Biologie', 'Biologie', 'Englisch', 'Klassenstunde'],
    },
    activities: {
      mon: [['12:45', 'Schlagzeug'], ['18:00', 'DLRG']],
      tue: [['14:00', 'Kletter-AG'], ['18:00', 'Jugendfeuerwehr']],
      wed: [['17:45', 'Tennis']],
      thu: [['17:30', 'MTB (optional)']],
      fri: [['16:00', 'Klettern']],
    },
  },
  {
    name: 'Jack',
    periods: GYM_PERIODS,
    days: {
      mon: ['Sport', 'Sport', 'Englisch', 'Englisch', 'Geografie', null, { subject: 'Mathe', note: 'Bolz' }, 'Klassenstunde'],
      tue: ['Deutsch', 'Deutsch', 'Musik', 'Musik', 'Religion', 'Religion'],
      wed: ['Mathe', 'Englisch', 'Sport', 'Deutsch', 'Latein', { subject: 'Geografie', note: 'Bolz' }, 'Englisch', 'Englisch'],
      thu: ['Mathe', 'Mathe', { subject: 'Deutsch', note: 'Bolz' }, { subject: 'Latein', note: 'Bolz' }, 'Bildende Kunst', 'Bildende Kunst'],
      fri: [{ subject: 'Englisch', note: 'Bolz' }, 'Musik', 'Latein', 'Latein', 'IuM', 'IuM'],
    },
    activities: {
      mon: [['18:00', 'DLRG']],
      tue: [['13:15', 'Gitarre'], ['17:30', 'Fußball (Kiebingen)'], ['18:00', 'Jugendfeuerwehr']],
      wed: [['16:15', 'Tennis']],
      thu: [['13:00', 'Imker-AG'], ['17:30', 'Fußball (Bühl)']],
    },
  },
  {
    name: 'Isla',
    periods: [
      ['07:45', '08:30'],
      ['08:30', '09:15'],
      ['09:20', '10:05'],
      ['10:30', '11:15'],
      ['11:20', '12:05'],
      ['12:10', '12:55'],
    ],
    days: {
      mon: ['Deutsch', 'Deutsch', 'Sport', 'Mathe', 'Sachunterricht'],
      tue: ['Mathe', 'Mathe', 'Deutsch', 'Religion', { subject: 'Mathe', note: 'Förder' }],
      wed: ['Mathe', 'Kunst/Werken', 'Kunst/Werken', 'Sachunterricht', 'Sachunterricht'],
      thu: ['Mathe', 'Musik', 'Religion', 'Deutsch', 'Deutsch'],
      fri: [{ subject: 'Deutsch', note: 'Förder' }, 'Deutsch', 'Deutsch', 'Sport', 'Sport'],
    },
    activities: {
      mon: [['17:00', 'DLRG']],
      wed: [['14:45', 'Tennis'], ['16:05', 'Flöten'], ['17:30', 'Turnen']],
      thu: [['15:00', 'Zambaioni'], ['17:30', 'Turnen']],
    },
  },
]

// Lernbüro (supervised study period): pick a room by subject.
export const LERNBUERO = {
  time: ['13:20', '14:05'],
  days: {
    mon: [
      { subjects: ['Latein', 'Geografie'], teacher: 'Fr. Angstenberger', room: 'R. 213' },
      { subjects: ['Deutsch', 'Mathe'], teacher: 'Fr. Baumann', room: 'R. 214' },
    ],
    wed: [
      { subjects: ['Englisch', 'Biologie'], teacher: 'Fr. Steinrode', room: 'R. 213' },
      { subjects: ['Mathe', 'Englisch'], teacher: 'Fr. Felten', room: 'R. 214' },
    ],
    thu: [
      { subjects: ['Deutsch', 'Französisch'], teacher: 'Fr. Deißler', room: 'R. 213' },
      { subjects: ['Mathe', 'Englisch'], teacher: 'Hr. Frick', room: 'R. 214' },
    ],
  },
}

export const SUBJECT_COLORS = {
  Deutsch: '#ff7a90',
  Mathe: '#4fa3ff',
  Englisch: '#3ddc97',
  Sport: '#ffb020',
}

export const WEEKDAYS = [
  { key: 'mon', short: 'Mo', long: 'Montag' },
  { key: 'tue', short: 'Di', long: 'Dienstag' },
  { key: 'wed', short: 'Mi', long: 'Mittwoch' },
  { key: 'thu', short: 'Do', long: 'Donnerstag' },
  { key: 'fri', short: 'Fr', long: 'Freitag' },
]

const PALETTE = ['#b18cff', '#4dd4e6', '#e67c73', '#5fa36f', '#f4a261', '#7986cb', '#e9c46a', '#d291bc', '#80cbc4', '#a1887f']

export function subjectColor(subject) {
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject]
  let hash = 0
  for (const ch of subject) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

// Index into WEEKDAYS for a date, or -1 at the weekend.
export const weekdayIndex = (date) => (date.getDay() + 6) % 7 < 5 ? (date.getDay() + 6) % 7 : -1

// One period's lesson as { subject, note }, or null when free.
export function lessonAt(child, dayKey, period) {
  const entry = child.days[dayKey]?.[period]
  if (!entry) return null
  return typeof entry === 'string' ? { subject: entry, note: '' } : { note: '', ...entry }
}

// Lessons for one child on one weekday, as [{ subject, note, start, end, period }], free periods dropped.
export function lessonsOn(child, dayKey) {
  return child.periods
    .map(([start, end], i) => {
      const lesson = lessonAt(child, dayKey, i)
      return lesson && { ...lesson, start, end, period: i + 1 }
    })
    .filter(Boolean)
}

export const timeToMinutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const nowMinutes = (date) => date.getHours() * 60 + date.getMinutes()

// The school day worth showing: today until the last child finishes, otherwise the next weekday.
export function focusDay(now) {
  const today = weekdayIndex(now)
  if (today >= 0) {
    const lastEnd = Math.max(0, ...TIMETABLES.flatMap(c => lessonsOn(c, WEEKDAYS[today].key).map(l => timeToMinutes(l.end))))
    if (nowMinutes(now) < lastEnd) return { index: today, isToday: true }
  }
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const next = weekdayIndex(tomorrow)
  return { index: next >= 0 ? next : 0, isToday: false, isTomorrow: next >= 0 }
}

// e.g. "Today until: Flynn 13:05 · Jack 15:15 · Isla 12:15"
export function schoolSummary(now) {
  const { index, isToday, isTomorrow } = focusDay(now)
  const day = WEEKDAYS[index]
  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : day.long
  const parts = TIMETABLES.map(c => {
    const lessons = lessonsOn(c, day.key)
    // Non-breaking space keeps each name with its time when the tile wraps.
    return `${c.name}\u00a0${lessons.length ? lessons[lessons.length - 1].end : 'free'}`
  })
  return `${label} until: ${parts.join(' · ')}`
}
