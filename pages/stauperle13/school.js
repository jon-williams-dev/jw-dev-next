import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import { BagIcon } from '../../components/kiosk_icons'
import {
  LERNBUERO, TIMETABLES, WEEKDAYS, focusDay, kitFor, lessonAt, lessonsOn, nowMinutes, subjectColor, timeToMinutes,
} from '../../lib/stauperle_timetables'
import styles from '../../styles/stauperle.module.scss'

// One tab per child, the Lernbüro rota, then the day's overview for everyone.
const TABS = [...TIMETABLES.map(c => c.name), 'Lernbüro', 'Today']
const LERNBUERO_TAB = TIMETABLES.length
const OVERVIEW_TAB = TIMETABLES.length + 1
const childAt = (tab) => TIMETABLES[tab]

export default function School() {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  // Time-dependent highlights are client-only, so server and kiosk render the same first frame.
  const [now, setNow] = useState(null)

  // ?child=Jack (or ?child=today, ?child=lernbuero) opens that tab directly.
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
  // After school the overview moves on to the next school day, and its tab says so.
  const tabLabel = (name, i) => i !== OVERVIEW_TAB || !focus || focus.isToday ? name
    : focus.isTomorrow ? 'Tomorrow' : WEEKDAYS[focus.index].long

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
              {tabLabel(name, i)}
            </button>
          ))}
        </div>

        {selected === OVERVIEW_TAB
          ? <Overview focus={focus} now={now} />
          : selected === LERNBUERO_TAB
            ? <Lernbuero focus={focus} />
            : <Timetable child={childAt(selected)} focus={focus} now={now} />}
      </div>
    </KioskLayout>
  )
}

// Back-to-back periods of the same subject become one block, e.g. a double lesson.
function lessonBlocks(child, dayKey) {
  const blocks = []
  for (const lesson of lessonsOn(child, dayKey)) {
    const last = blocks[blocks.length - 1]
    if (last && last.subject === lesson.subject && last.note === lesson.note && last.lastPeriod === lesson.period - 1) {
      last.end = lesson.end
      last.lastPeriod = lesson.period
      last.count++
    } else {
      blocks.push({ ...lesson, lastPeriod: lesson.period, count: 1 })
    }
  }
  return blocks
}

// Everyone's school day side by side: lessons, clubs afterwards and what to pack.
function Overview({ focus, now }) {
  if (!focus) return <div className={styles.overview} />
  const day = WEEKDAYS[focus.index]
  const minute = focus.isToday ? nowMinutes(now) : null

  return (
    <div className={styles.overview}>
      {TIMETABLES.map(child => {
        const blocks = lessonBlocks(child, day.key)
        const activities = child.activities?.[day.key] || []
        const kit = kitFor(child, day.key)
        return (
          <section key={child.name} className={styles.ovChild}>
            <div className={styles.ovHead}>
              <span className={styles.ovName}>{child.name}</span>
              <span>{blocks.length ? `${blocks[0].start} – ${blocks[blocks.length - 1].end}` : 'No school'}</span>
            </div>

            <ol className={styles.ovLessons}>
              {blocks.map(b => {
                const done = minute !== null && minute >= timeToMinutes(b.end)
                const current = minute !== null && !done && minute >= timeToMinutes(b.start)
                return (
                  <li
                    key={b.period}
                    className={`${styles.ovLesson} ${done ? styles.ovDone : ''} ${current ? styles.ttNow : ''}`}
                    style={{ '--subject': subjectColor(b.subject) }}
                  >
                    <span className={styles.ovTime}>{b.start}–{b.end}</span>
                    <span className={styles.ovSubject}>
                      {b.subject}{b.count > 1 && <small> ×{b.count}</small>}
                      {b.note && <span className={styles.ttNote}> · {b.note}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>

            {activities.length > 0 && (
              <div className={styles.ovAfter}>
                {activities.map(([time, name]) => <span key={time + name}><b>{time}</b> {name}</span>)}
              </div>
            )}
            {kit.length > 0 && (
              <div className={styles.ovKit}><BagIcon /> {kit.join(', ')}</div>
            )}
          </section>
        )
      })}
    </div>
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
