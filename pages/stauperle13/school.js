import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import KioskLayout from '../../components/kiosk_layout'
import {
  TIMETABLES, WEEKDAYS, focusDay, lessonAt, nowMinutes, subjectColor, timeToMinutes,
} from '../../lib/stauperle_timetables'
import styles from '../../styles/stauperle.module.scss'

export default function School() {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  // Time-dependent highlights are client-only, so server and kiosk render the same first frame.
  const [now, setNow] = useState(null)

  // ?child=Jack opens that child's tab directly.
  useEffect(() => {
    if (!router.isReady || !router.query.child) return
    const i = TIMETABLES.findIndex(c => c.name.toLowerCase() === String(router.query.child).toLowerCase())
    if (i >= 0) setSelected(i)
  }, [router.isReady, router.query.child])

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const child = TIMETABLES[selected]
  const hasActivities = Object.values(child.activities || {}).some(list => list.length)
  const focus = now && focusDay(now)
  const minute = now && nowMinutes(now)
  const isCurrent = (dayIndex, [start, end]) => focus?.isToday && focus.index === dayIndex
    && minute >= timeToMinutes(start) && minute < timeToMinutes(end)

  return (
    <KioskLayout title="School">
      <div className={styles.schoolPage}>
        {TIMETABLES.length > 1 && (
          <div className={styles.childTabs} role="tablist">
            {TIMETABLES.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="tab"
                aria-selected={i === selected}
                className={i === selected ? styles.childTabActive : ''}
                onClick={() => setSelected(i)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div
          className={styles.timetable}
          style={{ gridTemplateRows: `auto repeat(${child.periods.length}, minmax(0, 1fr))${hasActivities ? ' auto' : ''}` }}
        >
          <div className={styles.ttCorner} />
          {WEEKDAYS.map((d, i) => (
            <div key={d.key} className={`${styles.ttDay} ${focus?.index === i ? styles.ttFocus : ''}`}>
              {d.short}
              {focus?.index === i && <span>{focus.isToday ? 'today' : focus.isTomorrow ? 'tomorrow' : 'next'}</span>}
            </div>
          ))}

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
      </div>
    </KioskLayout>
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
