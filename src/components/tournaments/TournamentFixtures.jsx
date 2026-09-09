import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { tournamentMatches } from '../../data/tournamentModel'

export default function TournamentFixtures({ tournament, matches, canGenerate, onGenerate }) {
  const fixtures = tournamentMatches(matches, tournament.id)
  const groups = {}
  fixtures.forEach((match) => {
    const key = match.round || match.stage || match.date
    if (!groups[key]) groups[key] = []
    groups[key].push(match)
  })

  if (!fixtures.length) {
    return (
      <EmptyDashboardState
        icon="matches"
        title="No Fixtures"
        description="Fixtures have not been generated yet."
        actionLabel={canGenerate ? 'Generate Fixtures' : undefined}
        onClick={canGenerate ? onGenerate : undefined}
      />
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([round, items]) => (
        <section key={round}>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{round}</h3>
          <div className="space-y-3">
            {items.map((match) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{match.home}</p>
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">vs</p>
                    <p className="truncate font-semibold text-slate-900">{match.away}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {match.date} · {match.time}
                    </p>
                    <p className="text-xs text-slate-400">{match.venue}</p>
                  </div>
                  <StatusBadge status={match.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
