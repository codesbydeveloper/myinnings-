import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import TournamentCard from '../../components/tournaments/TournamentCard'
import TournamentFilters from '../../components/tournaments/TournamentFilters'
import { TournamentCardSkeleton } from '../../components/tournaments/TournamentSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useTournaments } from '../../context/TournamentContext'
import { canCreateTournament } from '../../utils/tournamentAccess'

const EMPTY = { status: 'all', format: 'all' }

function matchesStatus(tournament, status) {
  if (status === 'all') return true
  if (status === 'Upcoming') {
    return tournament.status === 'Draft' || tournament.status === 'Upcoming'
  }
  if (status === 'Ongoing') {
    return tournament.status === 'Ongoing' || tournament.status === 'Fixtures Generated'
  }
  return tournament.status === status
}

export default function Tournaments() {
  const { user } = useAuth()
  const { tournaments } = useTournaments()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [])

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    return tournaments.filter((item) => {
      if (!matchesStatus(item, filters.status)) return false
      if (filters.format !== 'all' && item.format !== filters.format) return false
      const haystack = [item.name, item.location, item.city, item.organizer]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return !value || haystack.includes(value)
    })
  }, [filters, query, tournaments])

  const activeCount = [query.trim(), filters.status !== 'all', filters.format !== 'all'].filter(Boolean).length
  const canCreate = canCreateTournament(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Tournaments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Discover and manage cricket tournaments.
          </p>
        </section>
        {canCreate ? (
          <Link
            to="/tournaments/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Create Tournament
          </Link>
        ) : null}
      </div>

      <TournamentFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onChange={setFilters}
        activeCount={activeCount}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY)
        }}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <TournamentCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="tournaments"
          title={tournaments.length ? 'No tournaments found.' : 'No tournaments available.'}
          description={
            tournaments.length
              ? 'No tournaments match your current search or filters.'
              : 'Create a tournament to open registration and generate fixtures.'
          }
          actionLabel={canCreate ? 'Create Tournament' : undefined}
          to={canCreate ? '/tournaments/new' : undefined}
        />
      )}
    </div>
  )
}
