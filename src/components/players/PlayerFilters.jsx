import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icons'
import { PLAYING_POSITIONS, AVAILABILITY_STATUSES } from '../../utils/teamAccess'

const STATUS_OPTIONS = ['Active', 'Inactive', 'Suspended']

export default function PlayerFilters({
  query,
  onQueryChange,
  filters,
  onChange,
  teamOptions = [],
  activeCount = 0,
  resultCount = 0,
  onClear,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const selectClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

  return (
    <div className="space-y-3" ref={rootRef}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search players</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name, role, or team"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Icon name="filter" className="h-4 w-4" />
          Filters
          {activeCount ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Team
            <select
              className={`mt-1.5 ${selectClass}`}
              value={filters.team}
              onChange={(event) => onChange({ ...filters, team: event.target.value })}
            >
              <option value="all">All Teams</option>
              {teamOptions.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
              <option value="unassigned">Unassigned</option>
            </select>
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Playing Role
            <select
              className={`mt-1.5 ${selectClass}`}
              value={filters.role}
              onChange={(event) => onChange({ ...filters, role: event.target.value })}
            >
              <option value="all">All Roles</option>
              {PLAYING_POSITIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Availability
            <select
              className={`mt-1.5 ${selectClass}`}
              value={filters.availability}
              onChange={(event) => onChange({ ...filters, availability: event.target.value })}
            >
              <option value="all">All Availability</option>
              {AVAILABILITY_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Status
            <select
              className={`mt-1.5 ${selectClass}`}
              value={filters.status}
              onChange={(event) => onChange({ ...filters, status: event.target.value })}
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p>
          Showing <span className="font-semibold text-slate-800">{resultCount}</span>{' '}
          {resultCount === 1 ? 'player' : 'players'}
        </p>
        {activeCount ? (
          <button
            type="button"
            onClick={onClear}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  )
}
