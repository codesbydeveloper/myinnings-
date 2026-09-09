import { Link } from 'react-router-dom'
import { todayKey } from '../../data/groundModel'
import { ROLES } from '../../utils/constants'
import EmptyDashboardState from './EmptyDashboardState'
import SectionCard from './SectionCard'
import StatusBadge from './StatusBadge'

function relevantBookings(bookings, user, visibleMatches = []) {
  const upcoming = bookings
    .filter((item) => item.status === 'Upcoming' && item.dateKey >= todayKey())
    .sort((left, right) => left.dateKey.localeCompare(right.dateKey) || left.startMinutes - right.startMinutes)

  if (user?.role === ROLES.PLAYER) {
    const ids = new Set(visibleMatches.map((match) => match.id))
    return upcoming.filter((item) => item.matchId && ids.has(item.matchId))
  }
  if (user?.role === ROLES.ORGANIZER) {
    return upcoming.filter((item) => item.tournamentId || item.type === 'Tournament')
  }
  if (user?.role === ROLES.CAPTAIN) {
    const ids = new Set(visibleMatches.map((match) => match.id))
    return upcoming.filter(
      (item) => !item.matchId || ids.has(item.matchId) || item.createdBy === user.name,
    )
  }
  return upcoming
}

export default function UpcomingVenueBookings({ bookings = [], user, visibleMatches = [] }) {
  const items = relevantBookings(bookings, user, visibleMatches).slice(0, 4)

  return (
    <SectionCard
      title="Upcoming Ground Bookings"
      action={
        <Link to="/grounds" className="text-sm font-medium text-emerald-700">
          View grounds
        </Link>
      }
    >
      {items.length === 0 ? (
        <EmptyDashboardState
          title="No Upcoming Bookings"
          description="No upcoming ground reservations."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.groundName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.date} · {item.startTime} – {item.endTime}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.tournamentName || item.matchTitle || item.type}
                  </p>
                </div>
                <StatusBadge status={item.type} />
              </div>
              {item.groundId ? (
                <Link
                  to={`/grounds/${item.groundId}`}
                  className="mt-2 inline-flex text-xs font-semibold text-emerald-700"
                >
                  View venue
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
