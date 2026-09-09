import { useMemo, useState } from 'react'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { defaultSlots, todayKey } from '../../data/groundModel'
import { formatDateKey } from '../../data/matchModel'
import { TOURNAMENT_WIP } from '../../utils/constants'

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export default function GroundSchedule({ ground, bookings = [] }) {
  const [dateKey, setDateKey] = useState(todayKey())
  const days = useMemo(
    () => Array.from({ length: 8 }, (_, index) => addDays(todayKey(), index)),
    [],
  )
  const slots = defaultSlots(ground)
  const dayBookings = bookings.filter(
    (item) => item.dateKey === dateKey && item.status !== 'Cancelled',
  )

  return (
    <div className="space-y-4">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setDateKey(day)}
              className={`min-h-11 rounded-xl px-3 text-sm font-semibold whitespace-nowrap ${
                dateKey === day
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day === todayKey() ? 'Today' : formatDateKey(day)}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Selected date
        <input
          type="date"
          className="mt-1.5 w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          value={dateKey}
          onChange={(event) => setDateKey(event.target.value)}
        />
      </label>

      {ground.status === 'Under Maintenance' ? (
        <EmptyDashboardState
          icon="alert"
          title="Ground under maintenance"
          description="This venue is not accepting bookings until maintenance is complete."
        />
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => {
            const booked = dayBookings.find(
              (item) => item.startMinutes < slot.endMinutes && item.endMinutes > slot.startMinutes,
            )
            return (
              <li
                key={slot.label}
                className={`rounded-2xl border p-4 ${
                  booked ? 'border-amber-100 bg-amber-50/60' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{slot.label}</p>
                    {booked ? (
                      <p className="mt-1 text-sm break-words text-slate-600">
                        {booked.matchTitle || (!TOURNAMENT_WIP && booked.tournamentName) || booked.type}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={booked ? 'Booked' : 'Available'} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
