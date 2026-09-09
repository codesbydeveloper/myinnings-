import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'

export default function PlayerAvailability({
  player,
  matches,
  canEdit,
  onChange,
}) {
  if (!matches.length) {
    return (
      <EmptyDashboardState
        icon="clipboard"
        title="No Upcoming Matches"
        description="There are currently no upcoming matches."
      />
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const status =
          match.availability?.[player.id] ||
          player.availabilityByMatch?.[match.id] ||
          player.availability
        return (
          <article
            key={match.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Match</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {match.home} vs {match.away}
                </h3>
                <p className="mt-2 text-xs font-medium tracking-wide text-slate-400 uppercase">Date</p>
                <p className="mt-1 text-sm text-slate-600">{match.date}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
                  Availability
                </p>
                <StatusBadge status={status} />
              </div>
            </div>
            {canEdit ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange(match.id, 'Available')}
                  className={`min-h-11 rounded-xl px-3 text-sm font-semibold ${
                    status === 'Available'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => onChange(match.id, 'Not Available')}
                  className={`min-h-11 rounded-xl px-3 text-sm font-semibold ${
                    status === 'Not Available'
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Not Available
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-400">
                Availability can only be updated by the player.
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
