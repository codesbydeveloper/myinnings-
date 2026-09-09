import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import MatchFilters from '../../components/matches/MatchFilters'
import MatchListCard from '../../components/matches/MatchListCard'
import { MatchCardSkeleton } from '../../components/matches/MatchSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { canCreateMatch, getVisibleMatches } from '../../utils/matchAccess'

const STATUS_TABS = ['All Matches', 'Upcoming', 'Live', 'Completed', 'Cancelled']

const EMPTY_FILTERS = {
  status: 'all',
  format: 'all',
  team: 'all',
  date: 'all',
  from: '',
  to: '',
}

function matchesDate(dateKey, filters) {
  if (!dateKey || filters.date === 'all') return true
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateKey}T00:00:00`)
  if (filters.date === 'today') {
    return target.getTime() === today.getTime()
  }
  if (filters.date === 'week') {
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return target >= start && target <= end
  }
  if (filters.date === 'month') {
    return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear()
  }
  if (filters.date === 'custom') {
    if (filters.from && target < new Date(`${filters.from}T00:00:00`)) return false
    if (filters.to && target > new Date(`${filters.to}T00:00:00`)) return false
  }
  return true
}

export default function Matches() {
  const { user } = useAuth()
  const { matches } = useMatches()
  const { teams, players } = useTeams()
  const [query, setQuery] = useState('')
  const [statusTab, setStatusTab] = useState('All Matches')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380)
    return () => window.clearTimeout(timer)
  }, [])

  const visible = useMemo(
    () => getVisibleMatches(matches, user, teams, players),
    [matches, players, teams, user],
  )

  const teamOptions = useMemo(
    () => Array.from(new Set(visible.flatMap((match) => [match.home, match.away]))).sort(),
    [visible],
  )

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    const status = statusTab === 'All Matches' ? 'all' : statusTab
    return visible.filter((match) => {
      if (status !== 'all' && match.status !== status) return false
      if (filters.status !== 'all' && match.status !== filters.status) return false
      const haystack = [match.home, match.away, match.venue, match.ground?.name, match.format]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (value && !haystack.includes(value)) return false
      if (filters.format !== 'all' && match.format !== filters.format) return false
      if (filters.team !== 'all' && match.home !== filters.team && match.away !== filters.team) {
        return false
      }
      return matchesDate(match.dateKey, filters)
    })
  }, [filters, query, statusTab, visible])

  const activeCount = [
    query.trim(),
    filters.status !== 'all',
    filters.format !== 'all',
    filters.team !== 'all',
    filters.date !== 'all',
  ].filter(Boolean).length

  const canCreate = canCreateMatch(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Matches
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage upcoming, live, and completed cricket matches.
          </p>
        </section>
        {canCreate ? (
          <Link
            to="/matches/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            Create Match
          </Link>
        ) : null}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {STATUS_TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatusTab(item)
                setFilters((current) => ({
                  ...current,
                  status: item === 'All Matches' ? 'all' : item,
                }))
              }}
              className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap ${
                statusTab === item
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <MatchFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          if (next.status === 'Draft') setStatusTab('All Matches')
          else setStatusTab(next.status === 'all' ? 'All Matches' : next.status)
        }}
        teamOptions={teamOptions}
        activeCount={activeCount}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
          setStatusTab('All Matches')
        }}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <MatchCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length ? (
        <div className="space-y-3">
          {results.map((match) => (
            <MatchListCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="matches"
          title={visible.length ? 'No matches found.' : 'No matches scheduled yet.'}
          description={
            visible.length
              ? 'No matches match your current search or filters.'
              : 'Create a match to set the date, opponent, ground, and squad.'
          }
          actionLabel={canCreate ? 'Create Match' : undefined}
          to={canCreate ? '/matches/new' : undefined}
        />
      )}
    </div>
  )
}
