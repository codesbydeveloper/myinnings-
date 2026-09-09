import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { matchWinnerName, tournamentMatches } from '../../data/tournamentModel'

export default function TournamentBracket({ tournament, matches }) {
  const related = tournamentMatches(matches, tournament.id)
  const rounds = tournament.knockout?.rounds?.length
    ? tournament.knockout.rounds
    : ['Quarter Final', 'Semi Final', 'Final']
        .map((name) => ({
          name,
          matchIds: related.filter((match) => match.stage === name).map((match) => match.id),
        }))
        .filter((round) => round.matchIds.length)

  if (!rounds.length) {
    return (
      <EmptyDashboardState
        icon="tournaments"
        title="No knockout bracket"
        description="The knockout bracket will appear once fixtures are generated or the league stage is complete."
      />
    )
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex min-w-max gap-6 pb-2">
        {rounds.map((round, roundIndex) => (
          <div key={round.name} className="w-64 shrink-0">
            <h3 className="mb-3 text-center text-sm font-semibold tracking-wide text-slate-500 uppercase">
              {round.name}
            </h3>
            <div className="space-y-4">
              {round.matchIds.map((matchId) => {
                const match = related.find((item) => item.id === matchId)
                if (!match) return null
                const winner = matchWinnerName(match)
                return (
                  <Link
                    key={matchId}
                    to={`/matches/${matchId}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <TeamSlot name={match.home} winner={winner === match.home} />
                    <p className="my-2 text-center text-[10px] font-semibold tracking-[0.2em] text-emerald-700">
                      VS
                    </p>
                    <TeamSlot name={match.away} winner={winner === match.away} />
                    <p className="mt-3 text-center text-xs text-slate-400">{match.status}</p>
                  </Link>
                )
              })}
            </div>
            {roundIndex < rounds.length - 1 ? (
              <p className="mt-4 text-center text-xs tracking-[0.3em] text-slate-300">↓</p>
            ) : tournament.winner ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                  Winner
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{tournament.winner}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamSlot({ name, winner }) {
  return (
    <p
      className={`truncate rounded-lg px-3 py-2 text-sm font-semibold ${
        winner ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {name || 'TBD'}
    </p>
  )
}
