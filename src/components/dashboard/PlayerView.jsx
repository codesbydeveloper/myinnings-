import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { canChangeMatchAvailability, getVisibleMatches } from '../../utils/matchAccess'
import { findOwnPlayer } from '../../utils/playerAccess'
import SectionCard from './SectionCard'
import StatusBadge from './StatusBadge'

export default function PlayerView() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches, setMatchAvailability } = useMatches()
  const { showToast } = useToast()
  const ownPlayer = findOwnPlayer(players, user)
  const upcoming = getVisibleMatches(matches, user, teams, players).filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live',
  )
  const nextMatch = upcoming[0]

  return (
    <>
      <SectionCard title="Next Match">
        {nextMatch ? (
          <Link to={`/matches/${nextMatch.id}`} className="block rounded-xl bg-slate-50 p-4 text-center sm:p-6">
            <p className="text-lg font-semibold text-slate-900">{nextMatch.home}</p>
            <p className="my-2 text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
              vs
            </p>
            <p className="text-lg font-semibold text-slate-900">{nextMatch.away}</p>
            <p className="mt-3 text-sm text-slate-500">
              {nextMatch.date} · {nextMatch.time}
            </p>
            <p className="mt-1 text-xs text-slate-400">{nextMatch.venue}</p>
          </Link>
        ) : (
          <p className="text-sm text-slate-500">No upcoming match assigned yet.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Availability Requests"
        action={
          <Link to="/availability" className="text-sm font-medium text-emerald-700">
            View all
          </Link>
        }
      >
        {upcoming.length ? (
          <ul className="space-y-3">
            {upcoming.slice(0, 3).map((match) => {
              const status =
                (ownPlayer && match.availability?.[ownPlayer.id]) ||
                ownPlayer?.availability ||
                'Pending'
              const label = `${match.home} vs ${match.away}`
              const canEdit = ownPlayer
                ? canChangeMatchAvailability(match, ownPlayer, user)
                : false
              return (
                <li key={match.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{label}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {match.date} · {match.time}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  {canEdit ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {['Available', 'Not Available'].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setMatchAvailability(match.id, ownPlayer.id, value)
                            showToast(`Marked ${value.toLowerCase()} for ${label}.`)
                          }}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                            status === value
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No upcoming availability requests.</p>
        )}
      </SectionCard>
    </>
  )
}
