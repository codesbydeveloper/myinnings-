import ResourcePage from '../../components/common/ResourcePage'
import StatusBadge from '../../components/dashboard/StatusBadge'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { canChangeMatchAvailability, getVisibleMatches } from '../../utils/matchAccess'
import { findOwnPlayer } from '../../utils/playerAccess'

export default function Availability() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches, setMatchAvailability } = useMatches()
  const { showToast } = useToast()
  const ownPlayer = findOwnPlayer(players, user)

  const requests = getVisibleMatches(matches, user, teams, players).filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live' || match.status === 'Draft',
  )

  return (
    <ResourcePage pathname="/availability">
      {requests.length ? (
        <div className="space-y-3">
          {requests.map((match) => {
            const status =
              (ownPlayer && match.availability?.[ownPlayer.id]) ||
              ownPlayer?.availability ||
              'Pending'
            const label = `${match.home} vs ${match.away}`
            const canEdit = ownPlayer
              ? canChangeMatchAvailability(match, ownPlayer, user)
              : false
            return (
              <article
                key={match.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-900">{label}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {match.date} · {match.time}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{match.venue}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                {canEdit ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {['Available', 'Not Available'].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setMatchAvailability(match.id, ownPlayer.id, value)
                          showToast(`Marked ${value.toLowerCase()} for ${label}.`)
                        }}
                        className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${
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
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyDashboardState
          icon="clipboard"
          title="No availability requests"
          description="Upcoming match availability requests will appear here."
        />
      )}
    </ResourcePage>
  )
}
