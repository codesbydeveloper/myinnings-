import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import PlayerCard from '../../components/players/PlayerCard'
import PlayerFilters from '../../components/players/PlayerFilters'
import { PlayerCardSkeleton } from '../../components/players/PlayerSkeletons'
import { useAuth } from '../../context/AuthContext'
import { usePlayers } from '../../context/PlayerContext'
import { ROLES } from '../../utils/constants'
import { canCreatePlayer, findOwnPlayer, getVisiblePlayers } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'

const EMPTY_FILTERS = {
  team: 'all',
  role: 'all',
  availability: 'all',
  status: 'all',
}

export default function Players() {
  const { user } = useAuth()
  const { players, teams } = usePlayers()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const ownPlayer = findOwnPlayer(players, user)
  const visibleTeams = useMemo(
    () => getVisibleTeams(teams, players, user),
    [players, teams, user],
  )
  const visiblePlayers = useMemo(
    () => getVisiblePlayers(players, teams, user),
    [players, teams, user],
  )

  const teamOptions = useMemo(() => {
    const names = new Set(visibleTeams.map((team) => team.name))
    visiblePlayers.forEach((player) => {
      if (player.teamName) names.add(player.teamName)
    })
    return Array.from(names).sort()
  }, [visiblePlayers, visibleTeams])

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    return visiblePlayers.filter((player) => {
      const matchesQuery =
        !value ||
        [player.name, player.position, player.role, player.teamName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(value))
      if (!matchesQuery) return false
      if (filters.team === 'unassigned' && player.teamId) return false
      if (filters.team !== 'all' && filters.team !== 'unassigned' && player.teamName !== filters.team) {
        return false
      }
      if (filters.role !== 'all' && player.position !== filters.role) return false
      if (filters.availability !== 'all' && player.availability !== filters.availability) return false
      if (filters.status !== 'all' && (player.status || 'Active') !== filters.status) return false
      return true
    })
  }, [filters, query, visiblePlayers])

  if (user?.role === ROLES.PLAYER && ownPlayer) {
    return <Navigate to={`/players/${ownPlayer.id}`} replace />
  }

  const activeCount = [
    query.trim(),
    filters.team !== 'all',
    filters.role !== 'all',
    filters.availability !== 'all',
    filters.status !== 'all',
  ].filter(Boolean).length

  const canCreate = canCreatePlayer(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Players
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage cricket players, profiles, and team memberships.
          </p>
        </section>
        {canCreate ? (
          <Link
            to="/players/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Add Player
          </Link>
        ) : null}
      </div>

      <PlayerFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onChange={setFilters}
        teamOptions={teamOptions}
        activeCount={activeCount}
        resultCount={results.length}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
        }}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <PlayerCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="players"
          title="No players found."
          description={
            visiblePlayers.length
              ? 'No players match your current search.'
              : 'Add players to build your team roster.'
          }
          actionLabel={canCreate ? 'Add Player' : undefined}
          to={canCreate ? '/players/new' : undefined}
        />
      )}
    </div>
  )
}
