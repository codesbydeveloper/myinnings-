import { Link } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import { approvedRegistrations } from '../../data/tournamentModel'
import TournamentLogo from './TournamentLogo'

export default function TournamentCard({ tournament }) {
  const approved = approvedRegistrations(tournament).length
  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5"
    >
      <div className="flex items-start gap-3">
        <TournamentLogo tournament={tournament} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-base font-semibold text-slate-900">{tournament.name}</h2>
            <StatusBadge status={tournament.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{tournament.location}</p>
          <p className="mt-3 text-sm text-slate-600">{tournament.format}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {approved} / {tournament.maxTeams} Teams Registered
          </p>
          <p className="mt-2 text-xs text-slate-400">Starts: {tournament.startDate}</p>
        </div>
      </div>
    </Link>
  )
}
