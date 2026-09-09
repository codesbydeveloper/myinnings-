import { Link } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import UserAvatar from '../common/UserAvatar'

export default function PlayerCard({ player }) {
  const muted = player.status === 'Inactive' || player.status === 'Suspended'

  return (
    <Link
      to={`/players/${player.id}`}
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        muted ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar name={player.name} src={player.avatar} className="h-12 w-12 text-sm" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900">{player.name}</h2>
          <p className="mt-0.5 truncate text-sm text-slate-500">{player.position}</p>
        </div>
        <StatusBadge status={player.status || 'Active'} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Team</dt>
          <dd className="mt-1 truncate font-semibold text-slate-800">
            {player.teamName || 'Unassigned'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Availability</dt>
          <dd className="mt-1">
            <StatusBadge status={player.availability} />
          </dd>
        </div>
      </dl>
    </Link>
  )
}
