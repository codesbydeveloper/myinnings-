import { useNavigate } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import { getUpcomingMatchCount } from '../../data/matches'
import { useMatches } from '../../context/MatchContext'
import { canArchiveTeam, canEditTeam, canManageRoster } from '../../utils/teamAccess'
import ActionMenu from './ActionMenu'
import TeamLogo from './TeamLogo'

export default function TeamCard({ team, user, onArchive }) {
  const navigate = useNavigate()
  const { matches } = useMatches()
  const upcoming = getUpcomingMatchCount(team.name, matches)
  const archived = team.status === 'Archived'

  const menuItems = [
    { label: 'View Team', icon: 'eye', onClick: () => navigate(`/teams/${team.id}`) },
  ]

  if (canEditTeam(team, user)) {
    menuItems.push({
      label: 'Edit Team',
      icon: 'pencil',
      onClick: () => navigate(`/teams/${team.id}/edit`),
    })
  }

  if (canManageRoster(team, user)) {
    menuItems.push({
      label: 'Manage Players',
      icon: 'players',
      onClick: () => navigate(`/teams/${team.id}?tab=players`),
    })
  }

  if (canArchiveTeam(user) && team.status !== 'Archived') {
    menuItems.push({
      label: 'Archive Team',
      icon: 'archive',
      tone: 'danger',
      onClick: () => onArchive?.(team),
    })
  }

  return (
    <article
      className={`group flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        archived ? 'border-amber-200/80 opacity-80' : 'border-slate-200 hover:border-emerald-200'
      }`}
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <div className="flex items-start gap-3">
        <TeamLogo team={team} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-slate-900">{team.name}</h2>
              <p className="mt-0.5 truncate text-sm text-slate-500">{team.location || team.city}</p>
            </div>
            <div className="flex shrink-0 items-center" onClick={(event) => event.stopPropagation()}>
              <ActionMenu items={menuItems} />
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Players</dt>
          <dd className="mt-1 font-semibold text-slate-800">{team.players}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Captain</dt>
          <dd className="mt-1 truncate font-semibold text-slate-800">{team.captain || 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Status</dt>
          <dd className="mt-1">
            <StatusBadge status={team.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Upcoming</dt>
          <dd className="mt-1 font-semibold text-slate-800">{upcoming} {upcoming === 1 ? 'match' : 'matches'}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="truncate text-xs text-slate-400">{team.type} team</p>
        <button
          type="button"
          className="text-sm font-semibold text-emerald-700 group-hover:text-emerald-800"
          onClick={(event) => {
            event.stopPropagation()
            navigate(`/teams/${team.id}`)
          }}
        >
          View Team
        </button>
      </div>
    </article>
  )
}
