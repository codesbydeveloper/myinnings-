import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import Icon from '../../components/common/Icons'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import SectionCard from '../../components/dashboard/SectionCard'
import StatusBadge from '../../components/dashboard/StatusBadge'
import AvailabilityModal from '../../components/grounds/AvailabilityModal'
import BookingFormModal from '../../components/grounds/BookingFormModal'
import BookingList from '../../components/grounds/BookingList'
import GroundImage from '../../components/grounds/GroundImage'
import GroundSchedule from '../../components/grounds/GroundSchedule'
import { GroundDetailsSkeleton } from '../../components/grounds/GroundSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useMatches } from '../../context/MatchContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { BOOKING_TYPES, formatMinutes, parseTimeToMinutes, todayKey } from '../../data/groundModel'
import {
  canCancelBooking,
  canCheckAvailability,
  canCreateBooking,
  canDeleteGround,
  canEditGround,
} from '../../utils/groundAccess'
import { getVisibleMatches } from '../../utils/matchAccess'
import { useTeams } from '../../context/TeamContext'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'bookings', label: 'Bookings' },
]

export default function GroundDetails() {
  const { groundId } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const {
    grounds,
    getGround,
    availabilityOf,
    bookingsForGround,
    checkAvailability,
    createBooking,
    cancelBooking,
    deleteGround,
  } = useGrounds()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [availabilityOpen, setAvailabilityOpen] = useState(false)
  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [cancelItem, setCancelItem] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ type: 'all', status: 'all', date: 'all' })

  const ground = getGround(groundId)
  const tab = TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'overview'

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 340)
    return () => window.clearTimeout(timer)
  }, [groundId])

  const bookings = bookingsForGround(groundId)
  const upcoming = bookings.filter((item) => item.status === 'Upcoming' && item.dateKey >= todayKey())
  const visibleMatches = getVisibleMatches(matches, user, teams, players)
  const needle = query.trim().toLowerCase()
  const filteredBookings = bookings.filter((item) => {
    if (filters.type !== 'all' && item.type !== filters.type) return false
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.date === 'upcoming' && !(item.status === 'Upcoming' && item.dateKey >= todayKey())) return false
    if (filters.date === 'past' && item.dateKey >= todayKey() && item.status !== 'Completed') return false
    if (needle) {
      const haystack = [item.code, item.type, item.matchTitle, item.tournamentName, item.date]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  function setTab(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  if (loading) return <GroundDetailsSkeleton />

  if (!ground) {
    return (
      <EmptyDashboardState
        icon="grounds"
        title="Ground not found"
        description="This venue is unavailable."
        actionLabel="Back to Grounds"
        to="/grounds"
      />
    )
  }

  const availability = availabilityOf(ground)
  const hours = `${formatMinutes(parseTimeToMinutes(ground.openingTime))} – ${formatMinutes(parseTimeToMinutes(ground.closingTime))}`

  return (
    <div className="space-y-6">
      <Link to="/grounds" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        Back to Grounds
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <GroundImage ground={ground} className="h-48 w-full sm:h-56" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{ground.name}</h1>
              <StatusBadge status={availability} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {[ground.address, ground.city || ground.location, ground.state].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCheckAvailability(user?.role) ? (
              <button
                type="button"
                onClick={() => {
                  setAvailabilityResult(null)
                  setAvailabilityOpen(true)
                }}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Check Availability
              </button>
            ) : null}
            {canCreateBooking(user?.role) && ground.status !== 'Under Maintenance' ? (
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
              >
                Create Booking
              </button>
            ) : null}
            {canEditGround(user) ? (
              <button
                type="button"
                onClick={() => navigate(`/grounds/${ground.id}/edit`)}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Edit Ground
              </button>
            ) : null}
            {canDeleteGround(user) ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="min-h-11 rounded-xl border border-red-100 px-4 text-sm font-semibold text-red-600"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap ${
                tab === item.id
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Ground Information">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Info label="Name" value={ground.name} />
                <Info label="Address" value={ground.address || '—'} />
                <Info label="City" value={ground.city || ground.location} />
                <Info label="Capacity" value={ground.capacity ? Number(ground.capacity).toLocaleString('en-IN') : '—'} />
                <Info label="Number of pitches" value={String(ground.pitches || 1)} />
                <Info label="Opening hours" value={hours} />
              </dl>
            </SectionCard>
            <SectionCard title="Facilities">
              {ground.facilities?.length ? (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ground.facilities.map((item) => (
                    <li key={item} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                      ✓ {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No facilities listed yet.</p>
              )}
            </SectionCard>
          </div>
          {ground.description ? (
            <SectionCard title="Ground Description">
              <p className="text-sm leading-6 text-slate-600">{ground.description}</p>
            </SectionCard>
          ) : null}
          <SectionCard title="Upcoming Bookings">
            {upcoming.length ? (
              <ul className="divide-y divide-slate-100">
                {upcoming.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {item.matchTitle || item.tournamentName || item.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.date} · {item.startTime} – {item.endTime}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyDashboardState
                icon="grounds"
                title="No Upcoming Bookings"
                description="No upcoming ground reservations."
              />
            )}
          </SectionCard>
        </div>
      ) : null}

      {tab === 'schedule' ? <GroundSchedule ground={ground} bookings={bookings} /> : null}

      {tab === 'bookings' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bookings"
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <select
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="all">All types</option>
              {BOOKING_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="all">All statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
            >
              <option value="all">All dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <BookingList
            bookings={filteredBookings}
            canCancel={(item) => canCancelBooking(item, user)}
            onCancel={setCancelItem}
          />
        </div>
      ) : null}

      <AvailabilityModal
        open={availabilityOpen}
        ground={ground}
        grounds={grounds}
        result={availabilityResult}
        onClose={() => setAvailabilityOpen(false)}
        onCheck={(payload) => setAvailabilityResult(checkAvailability(payload))}
      />

      <BookingFormModal
        open={bookingOpen}
        ground={ground}
        grounds={grounds}
        matches={visibleMatches.filter((item) => item.status === 'Upcoming' || item.status === 'Live')}
        tournaments={tournaments}
        role={user?.role}
        lockGround
        onClose={() => setBookingOpen(false)}
        onSave={(payload) => {
          const result = createBooking(payload)
          if (!result.ok) {
            showToast(result.message, 'error')
            return
          }
          setBookingOpen(false)
          showToast('Booking created successfully.')
          setTab('bookings')
        }}
      />

      <ConfirmModal
        open={Boolean(cancelItem)}
        title="Are you sure you want to cancel this booking?"
        description="The time slot will become available again. The booking record is kept as Cancelled."
        confirmLabel="Cancel Booking"
        icon="alert"
        variant="danger"
        onCancel={() => setCancelItem(null)}
        onConfirm={() => {
          cancelBooking(cancelItem.id)
          setCancelItem(null)
          showToast('Booking cancelled.')
        }}
      />

      <ConfirmModal
        open={deleteOpen}
        title={`Delete ${ground.name}?`}
        description="Only Platform Admin can delete grounds. Upcoming bookings must be cleared first."
        confirmLabel="Delete Ground"
        icon="alert"
        variant="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          const result = deleteGround(ground.id)
          setDeleteOpen(false)
          if (!result.ok) {
            showToast(result.message, 'error')
            return
          }
          showToast('Ground deleted.')
          navigate('/grounds')
        }}
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold break-words text-slate-800">{value || '—'}</dd>
    </div>
  )
}
