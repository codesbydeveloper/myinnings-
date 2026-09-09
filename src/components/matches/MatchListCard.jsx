import { Link } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import { getTeamInitials } from '../../utils/helpers'

export default function MatchListCard({ match }) {
  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950">
              {getTeamInitials(match.home)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{match.home}</p>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                vs
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">{match.away}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {match.date} · {match.time}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">
            {match.venue || match.ground?.name} · {match.format}
          </p>
        </div>
        <StatusBadge status={match.status} />
      </div>
    </Link>
  )
}
