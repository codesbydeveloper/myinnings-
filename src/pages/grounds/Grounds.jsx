import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import GroundCard from '../../components/grounds/GroundCard'
import GroundFilters from '../../components/grounds/GroundFilters'
import { GroundCardSkeleton } from '../../components/grounds/GroundSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { facilityMatches, matchesCapacityFilter } from '../../data/groundModel'
import { canCreateGround } from '../../utils/groundAccess'

const EMPTY_FILTERS = { availability: 'all', facility: 'all', capacity: 'all' }

export default function Grounds() {
  const { user } = useAuth()
  const { grounds, availabilityOf } = useGrounds()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return grounds.filter((ground) => {
      const availability = availabilityOf(ground)
      if (filters.availability !== 'all' && availability !== filters.availability) return false
      if (filters.facility !== 'all' && !facilityMatches(ground.facilities, filters.facility)) return false
      if (!matchesCapacityFilter(ground.capacity, filters.capacity)) return false
      if (!needle) return true
      return [ground.name, ground.city, ground.location, ground.state, ground.address]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle))
    })
  }, [availabilityOf, filters, grounds, query])

  const activeCount =
    [filters.availability, filters.facility, filters.capacity].filter((value) => value !== 'all').length +
    (query ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Grounds & Venues</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Find, manage, and schedule cricket grounds.
          </p>
        </section>
        {canCreateGround(user?.role) ? (
          <Link
            to="/grounds/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            + Add Ground
          </Link>
        ) : null}
      </div>

      <GroundFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onChange={setFilters}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
        }}
        activeCount={activeCount}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <GroundCardSkeleton key={index} />
          ))}
        </div>
      ) : results.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((ground) => (
            <GroundCard key={ground.id} ground={ground} availability={availabilityOf(ground)} />
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="grounds"
          title="No grounds found."
          description={
            grounds.length
              ? 'No grounds match your search.'
              : 'Add a cricket ground to start taking bookings.'
          }
          actionLabel={canCreateGround(user?.role) ? 'Add Ground' : undefined}
          to={canCreateGround(user?.role) ? '/grounds/new' : undefined}
        />
      )}
    </div>
  )
}
