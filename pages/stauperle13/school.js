import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import {
  LERNBUERO, TIMETABLES, WEEKDAYS, focusDay, lessonAt, nowMinutes, subjectColor, timeToMinutes,
} from '../../lib/stauperle_timetables'
import styles from '../../styles/stauperle.module.scss'

// One tab per child, then the Lernbüro rota.
const TABS = [...TIMETABLES.map(c => c.name), 'Lernbüro']
const LERNBUERO_TAB = TIMETABLES.length

export default function School() {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  // Time-dependent highlights are client-only, so server and kiosk render the same first frame.
  const [now, setNow] = useState(null)

  // ?child=Jack (or ?child=lernbuero) opens that tab directly.
  useEffect(() => {
    if (!router.isReady || !router.query.child) return
    const wanted = String(router.query.child).toLowerCase().replace('ü', 'ue')
    const i = TABS.findIndex(name => name.toLowerCase().replace('ü', 'ue') === wanted)
    if (i >= 0) setSelected(i)
  }, [router.isReady, router.query.child])

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const focus = now && focusDay(now)

  return (
    <KioskLayout title="School">
      <div className={styles.schoolPage}>
        <div className={styles.childTabs} role="tablist">
          {TABS.map((name, i) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={i === selected}
              className={[
                i === selected ? styles.childTabActive : '',
                i === LERNBUERO_TAB ? styles.lbTab : '',
              ].join(' ')}
              onClick={() => setSelected(i)}
            >
              {name}
            </button>
          ))}
        </div>

        {selected === LERNBUERO_TAB
          ? <Lernbuero focus={focus} />
          : <Timetable child={TIMETABLES[selected]} focus={focus} now={now} />}
      </div>
    </KioskLayout>
  )
}

function DayHeaders({ focus }) {
  return (
    <>
      <div className={styles.ttCorner} />
      {WEEKDAYS.map((d, i) => (
        <div key={d.key} className={`${styles.ttDay} ${focus?.index === i ? styles.ttFocus : ''}`}>
          {d.short}
          {focus?.index === i && <span>{focus.isToday ? 'today' : focus.isTomorrow ? 'tomorrow' : 'next'}</span>}
        </div>
      ))}
    </>
  )
}

function Timetable({ child, focus, now }) {
  const hasActivities = Object.values(child.activities || {}).some(list => list.length)
  const minute = now && nowMinutes(now)
  const isCurrent = (dayIndex, [start, end]) => focus?.isToday && focus.index === dayIndex
    && minute >= timeToMinutes(start) && minute < timeToMinutes(end)

  return (
    <div
      className={styles.timetable}
      style={{ gridTemplateRows: `auto repeat(${child.periods.length}, minmax(0, 1fr))${hasActivities ? ' auto' : ''}` }}
    >
      <DayHeaders focus={focus} />

      {child.periods.map((period, p) => (
        <Row key={p} period={period} p={p} child={child} focus={focus} isCurrent={isCurrent} />
      ))}

      {hasActivities && (
        <>
          <div className={styles.ttTime}><span>After<br />school</span></div>
          {WEEKDAYS.map((d, i) => (
            <div key={d.key} className={`${styles.ttActivities} ${focus?.index === i ? styles.ttFocus : ''}`}>
              {(child.activities[d.key] || []).map(([time, name]) => (
                <span key={time + name}><b>{time}</b> {name}</span>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function Row({ period, p, child, focus, isCurrent }) {
  return (
    <>
      <div className={styles.ttTime}>
        <strong>{p + 1}</strong>
        <span>{period[0]}<br />{period[1]}</span>
      </div>
      {WEEKDAYS.map((d, i) => {
        const lesson = lessonAt(child, d.key, p)
        const classes = [
          styles.ttCell,
          focus?.index === i ? styles.ttFocus : '',
          lesson ? '' : styles.ttFree,
          isCurrent(i, period) ? styles.ttNow : '',
        ].join(' ')
        return (
          <div key={d.key} className={classes} style={lesson ? { '--subject': subjectColor(lesson.subject) } : undefined}>
            {lesson && <span className={styles.ttSubject}>{lesson.subject}</span>}
            {lesson?.note && <span className={styles.ttNote}>{lesson.note}</span>}
          </div>
        )
      })}
    </>
  )
}

function Lernbuero({ focus }) {
  return (
    <div className={styles.timetable} style={{ gridTemplateRows: 'auto minmax(0, 1fr)' }}>
      <DayHeaders focus={focus} />

      <div className={`${styles.ttTime} ${styles.lbTime}`}>
        <span>{LERNBUERO.time[0]}<br />{LERNBUERO.time[1]}</span>
      </div>
      {WEEKDAYS.map((d, i) => {
        const rooms = LERNBUERO.days[d.key] || []
        return (
          <div key={d.key} className={`${styles.lbDay} ${focus?.index === i ? styles.ttFocus : ''}`}>
            {rooms.length ? rooms.map(r => (
              <div key={r.room} className={styles.lbRoom} style={{ '--subject': subjectColor(r.subjects[0]) }}>
                <strong>{r.subjects.join(' / ')}</strong>
                <span>{r.teacher}</span>
                <span className={styles.lbRoomNo}>{r.room}</span>
              </div>
            )) : <span className={styles.lbNone}>–</span>}
          </div>
        )
      })}
    </div>
  )
}
