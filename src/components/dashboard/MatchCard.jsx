import { Link } from 'react-router-dom'
import { getTeamInitials } from '../../utils/helpers'
import StatusBadge from './StatusBadge'

export default function MatchCard({ match }) {
  return (
    <article className="rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950">
              {getTeamInitials(match.home)}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">{match.home}</p>
          </div>
          <p className="my-1 pl-10 text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
            vs
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
              {getTeamInitials(match.away)}
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">{match.away}</p>
          </div>
        </div>
        <StatusBadge status={match.status} />
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {match.date} · {match.time}
      </p>
      <p className="mt-1 truncate text-xs text-slate-400">
        {match.venue} · {match.format || 'T20'}
      </p>
      <Link
        to={`/matches/${match.id}`}
        className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        View Details
      </Link>
    </article>
  )
}
