import { Link } from 'react-router-dom'

export default function MatchList({ matches }) {
  return (
    <ul className="space-y-3">
      {matches.map((match) => (
        <li key={match.id}>
          <Link
            to="/matches"
            className="block rounded-lg border border-slate-100 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <p className="text-sm font-medium text-slate-900">
              {match.home} vs {match.away}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {match.date} · {match.time}
            </p>
            {match.venue && (
              <p className="mt-1 truncate text-xs text-slate-400">{match.venue}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
