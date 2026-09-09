import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import UserAvatar from '../common/UserAvatar'
import ProgressBar from '../dashboard/ProgressBar'

const GROUPS = [
  { key: 'Available', title: 'Available' },
  { key: 'Not Available', title: 'Not Available' },
  { key: 'Pending', title: 'Pending Response' },
]

export default function MatchAvailabilityPanel({
  roster,
  availability,
  ownPlayer,
  canEditOwn,
  onChange,
}) {
  if (!roster.length) {
    return (
      <EmptyDashboardState
        icon="players"
        title="No Available Players"
        description="No players are currently available for this match."
      />
    )
  }

  const availableCount = roster.filter(
    (player) => (availability[player.id] || player.availability) === 'Available',
  ).length

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Available Players</span>
          <span className="font-semibold text-slate-800">
            {availableCount} / {roster.length}
          </span>
        </div>
        <ProgressBar value={availableCount} total={roster.length || 1} />
      </div>

      {canEditOwn && ownPlayer ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Your availability</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {['Available', 'Not Available'].map((status) => {
              const current = availability[ownPlayer.id] || ownPlayer.availability
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onChange(ownPlayer.id, status)}
                  className={`min-h-11 rounded-xl text-sm font-semibold ${
                    current === status
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  {status}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {GROUPS.map((group) => {
          const list = roster.filter(
            (player) => (availability[player.id] || player.availability || 'Pending') === group.key,
          )
          return (
            <div key={group.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{group.title}</p>
                <span className="text-xs text-slate-400">{list.length}</span>
              </div>
              {list.length ? (
                <ul className="space-y-3">
                  {list.map((player) => (
                    <li key={player.id} className="flex items-center gap-3">
                      <UserAvatar name={player.name} src={player.avatar} className="h-9 w-9 text-xs" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{player.name}</p>
                        <p className="text-xs text-slate-500">{player.position}</p>
                      </div>
                      <StatusBadge status={group.key} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">No players in this group.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
