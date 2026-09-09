import { useMemo, useState } from 'react'
import Icon from '../common/Icons'
import EmptyDashboardState from './EmptyDashboardState'
import SectionCard from './SectionCard'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarWidget({ matches = [] }) {
  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [selected, setSelected] = useState(() => {
    const upcoming = matches.find((match) => match.status === 'Upcoming')
    return upcoming?.dateKey ?? toKey(today.getFullYear(), today.getMonth(), today.getDate())
  })

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const label = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = Array.from({ length: firstDay }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day)
    }
    return cells
  }, [year, month])

  const matchDates = new Set(matches.map((match) => match.dateKey))
  const selectedEvents = matches.filter((match) => match.dateKey === selected)

  return (
    <SectionCard title="Schedule">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Previous month"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Next month"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day, index) => (
          <span key={`${day}-${index}`} className="py-1 text-[11px] font-semibold text-slate-400">
            {day}
          </span>
        ))}
        {days.map((day, index) => {
          if (!day) {
            return <span key={`empty-${index}`} />
          }
          const key = toKey(year, month, day)
          const isSelected = selected === key
          const hasMatch = matchDates.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`relative rounded-lg py-1.5 text-xs font-medium transition ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : hasMatch
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day}
              {hasMatch && !isSelected ? (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {new Date(`${selected}T00:00:00`).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
          })}
        </p>
        {selectedEvents.length === 0 ? (
          <div className="mt-3">
            <EmptyDashboardState
              icon="clock"
              title="No matches on this date"
              description="Select a highlighted date to see fixtures."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedEvents.map((match) => (
              <li key={match.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-medium text-emerald-700">{match.time}</p>
                <p className="text-sm font-medium text-slate-800">
                  {match.home} vs {match.away}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  )
}
