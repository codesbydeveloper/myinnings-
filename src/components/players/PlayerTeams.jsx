import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import TeamLogo from '../teams/TeamLogo'
import { getVisibleTeams } from '../../utils/teamAccess'

export default function PlayerTeams({ player, teams, user, players }) {
  const visibleIds = new Set(getVisibleTeams(teams, players, user).map((team) => team.id))
  const current = player.teamId ? teams.find((team) => team.id === player.teamId) : null
  const previous = player.previousTeams || []

  if (!current && !previous.length) {
    return (
      <EmptyDashboardState
        icon="teams"
        title="No team history"
        description="This player is not linked to a team yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      {current ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Current Team
          </h3>
          <TeamHistoryCard
            team={current}
            joinedDate={player.joinedDate}
            status="Current"
            canOpen={visibleIds.has(current.id)}
          />
        </section>
      ) : null}

      {previous.length ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Previous Teams
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {previous.map((item) => {
              const team = teams.find((entry) => entry.id === item.id) || item
              return (
                <TeamHistoryCard
                  key={`${item.id}-${item.joinedDate}`}
                  team={team}
                  joinedDate={item.joinedDate}
                  status={item.status || 'Former'}
                  canOpen={Boolean(item.id) && visibleIds.has(item.id)}
                />
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function TeamHistoryCard({ team, joinedDate, status, canOpen }) {
  const content = (
    <article className="flex h-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <TeamLogo team={team} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{team.name}</p>
            <p className="mt-0.5 truncate text-sm text-slate-500">{team.location || team.city}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="mt-3 text-xs text-slate-400">Joined {joinedDate || '—'}</p>
      </div>
    </article>
  )

  if (canOpen && team.id) {
    return (
      <Link to={`/teams/${team.id}`} className="block transition hover:-translate-y-0.5">
        {content}
      </Link>
    )
  }

  return content
}
