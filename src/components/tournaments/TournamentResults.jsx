import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { matchWinnerName, tournamentMatches } from '../../data/tournamentModel'

export default function TournamentResults({ tournament, matches }) {
  const completed = tournamentMatches(matches, tournament.id).filter(
    (match) => match.status === 'Completed',
  )
  if (!completed.length) {
    return (
      <EmptyDashboardState
        icon="matches"
        title="No Results"
        description="No completed matches yet."
      />
    )
  }

  return (
    <div className="space-y-3">
      {completed.map((match) => (
        <Link
          key={match.id}
          to={`/matches/${match.id}`}
          className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <p className="font-semibold text-slate-900">
            {match.home} <span className="text-xs tracking-[0.18em] text-emerald-700">VS</span> {match.away}
          </p>
          <p className="mt-2 text-sm text-slate-700">{match.result || match.resultDetail?.summary}</p>
          <p className="mt-1 text-xs text-slate-400">
            {match.date}
            {matchWinnerName(match) ? ` · Winner: ${matchWinnerName(match)}` : ''}
          </p>
        </Link>
      ))}
    </div>
  )
}
