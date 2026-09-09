import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import TeamCard from '../../components/teams/TeamCard'
import TeamFilters from '../../components/teams/TeamFilters'
import { TeamCardSkeleton } from '../../components/teams/TeamSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { canCreateTeam, getVisibleTeams, isMyTeam } from '../../utils/teamAccess'

export default function Teams() {
  const { user } = useAuth()
  const { teams, players, setTeamStatus } = useTeams()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(timer)
  }, [])

  const visible = useMemo(
    () => getVisibleTeams(teams, players, user),
    [players, teams, user],
  )

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    return visible.filter((team) => {
      const matchesQuery =
        !value ||
        [team.name, team.location, team.city, team.captain]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(value))

      if (!matchesQuery) return false
      if (filter === 'active') return team.status === 'Active'
      if (filter === 'inactive') return team.status === 'Inactive'
      if (filter === 'mine') return isMyTeam(team, user, players)
      return true
    })
  }, [filter, players, query, user, visible])

  const canCreate = canCreateTeam(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Teams
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your cricket teams and team rosters.
          </p>
        </section>
        {canCreate ? (
          <Link
            to="/teams/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Create Team
          </Link>
        ) : null}
      </div>

      <TeamFilters
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <TeamCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              user={user}
              onArchive={(item) => {
                setTeamStatus(item.id, 'Archived')
                showToast(`${item.name} has been archived.`)
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="teams"
          title="No teams found."
          description={
            visible.length
              ? 'No teams match your current search.'
              : 'Create a team to start building your cricket club.'
          }
          actionLabel={canCreate ? 'Create Team' : undefined}
          to={canCreate ? '/teams/new' : undefined}
        />
      )}
    </div>
  )
}
