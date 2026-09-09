import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { getTeamInitials, opponentOf } from '../../utils/helpers'

export default function PlayerMatches({ player, matches }) {
  const upcoming = matches.filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live',
  )
  const past = matches.filter((match) => match.status === 'Completed')

  return (
    <div className="space-y-6">
      <MatchGroup
        title="Upcoming Matches"
        emptyTitle="No Upcoming Matches"
        emptyDescription="There are currently no upcoming matches."
        matches={upcoming}
        player={player}
      />
      <MatchGroup
        title="Past Matches"
        emptyTitle="No past matches"
        emptyDescription="Completed matches will appear here."
        matches={past}
        player={player}
        showResult
      />
    </div>
  )
}

function MatchGroup({ title, emptyTitle, emptyDescription, matches, player, showResult }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h3>
      {matches.length ? (
        <div className="space-y-3">
          {matches.map((match) => {
            const opponent = opponentOf(match, player.teamName)
            const inSquad = match.squad?.selectedIds?.includes(player.id)
            const resultText =
              typeof match.result === 'string' ? match.result : match.resultDetail?.summary
            return (
              <article
                key={match.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950">
                        {getTeamInitials(player.teamName || match.home)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {player.teamName || match.home}
                        </p>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                          vs
                        </p>
                        <p className="truncate text-sm font-semibold text-slate-900">{opponent}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {match.date} · {match.format}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{match.venue}</p>
                    {showResult && resultText ? (
                      <p className="mt-2 text-sm font-medium text-slate-800">{resultText}</p>
                    ) : null}
                    {inSquad ? (
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Selected in squad</p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <StatusBadge status={match.status} />
                    <Link
                      to={`/matches/${match.id}`}
                      className="text-sm font-semibold text-emerald-700"
                    >
                      View Match
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyDashboardState icon="matches" title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  )
}
