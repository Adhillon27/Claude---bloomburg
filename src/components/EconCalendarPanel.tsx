import { useMemo } from 'react'
import { generateEconCalendar } from '../data/econCalendar'

export function EconCalendarPanel() {
  const events = useMemo(() => generateEconCalendar(), [])
  const now = Date.now()

  return (
    <div className="econ-wrap">
      {events.map((e) => {
        const isPast = e.timestamp < now
        const d = new Date(e.timestamp)
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        return (
          <div key={e.id} className={`econ-row ${isPast ? 'econ-row--past' : ''}`}>
            <span className="econ-row__date">
              {dateStr}
              <br />
              {timeStr}
            </span>
            <span className="econ-row__country">{e.country}</span>
            <span className={`econ-row__importance econ-row__importance--${e.importance}`} title={e.importance} />
            <span className="econ-row__event">{e.event}</span>
            <span className="econ-row__stats">
              <span>
                A <b>{e.actual}</b>
              </span>
              <span>
                F <b>{e.forecast}</b>
              </span>
              <span>
                P <b>{e.previous}</b>
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
