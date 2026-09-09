import { Link } from 'react-router-dom'
import UserAvatar from '../common/UserAvatar'
import SectionCard from './SectionCard'
import StatusBadge from './StatusBadge'
import { useTournaments } from '../../context/TournamentContext'
import { approvedRegistrations } from '../../data/tournamentModel'
import { TOURNAMENT_WIP } from '../../utils/constants'

export default function AdminView({ data }) {
  const { tournaments } = useTournaments()
  const recent = tournaments.slice(0, 3)
  return (
    <>
      <SectionCard
        title="Recent Users"
        action={
          <Link to="/users" className="text-sm font-medium text-emerald-700">
            Manage
          </Link>
        }
      >
        <ul className="space-y-3">
          {data.recentUsers?.map((user) => (
            <li key={user.id} className="flex items-center gap-3">
              <UserAvatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {user.role} · {user.joined}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      {TOURNAMENT_WIP ? null : (
      <SectionCard
        title="Recent Tournaments"
        action={
          <Link to="/reports/tournaments" className="text-sm font-medium text-emerald-700">
            View Full Reports
          </Link>
        }
      >
        <ul className="space-y-3">
          {recent.map((tournament) => (
            <li
              key={tournament.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
            >
              <div className="min-w-0">
                <Link to={`/tournaments/${tournament.id}`} className="truncate text-sm font-medium text-slate-900">
                  {tournament.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {approvedRegistrations(tournament).length} Teams · {tournament.city || tournament.location}
                </p>
              </div>
              <StatusBadge status={tournament.status} />
            </li>
          ))}
        </ul>
      </SectionCard>
      )}
    </>
  )
}
