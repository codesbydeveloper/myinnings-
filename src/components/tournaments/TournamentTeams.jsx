import StatusBadge from '../dashboard/StatusBadge'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import TeamLogo from '../teams/TeamLogo'
import { approvedRegistrations } from '../../data/tournamentModel'

export default function TournamentTeams({
  tournament,
  teams,
  canApprove,
  canRegister,
  onRegister,
  onApprove,
  onReject,
}) {
  const list = tournament.registrations || []
  const approved = approvedRegistrations(tournament).length
  const atLimit = approved >= tournament.maxTeams

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Approved {approved} / {tournament.maxTeams}
        </p>
        {canRegister ? (
          <button
            type="button"
            onClick={onRegister}
            className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
          >
            Register Team
          </button>
        ) : null}
      </div>
      {atLimit ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Maximum team limit has been reached.
        </p>
      ) : null}
      {list.length ? (
        <ul className="space-y-3">
          {list.map((item) => {
            const team = teams.find((entry) => entry.id === item.teamId)
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <TeamLogo team={team || { name: item.teamName, colors: { primary: '#059669' } }} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.teamName}</p>
                      <p className="text-sm text-slate-500">
                        Captain {item.captain || 'Unassigned'} · {item.players} players
                      </p>
                      <p className="text-xs text-slate-400">{item.date}</p>
                      {item.status === 'Rejected' && item.reason ? (
                        <p className="mt-1 text-xs text-red-600">Reason: {item.reason}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    {canApprove && item.status === 'Pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={atLimit}
                          onClick={() => onApprove(item)}
                          className="min-h-11 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(item)}
                          className="min-h-11 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyDashboardState
          icon="teams"
          title="No Registered Teams"
          description="No teams have registered yet."
          actionLabel={canRegister ? 'Register Team' : undefined}
          onClick={canRegister ? onRegister : undefined}
        />
      )}
    </div>
  )
}
