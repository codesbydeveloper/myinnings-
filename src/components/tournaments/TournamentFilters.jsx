import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icons'
import { TOURNAMENT_FORMATS } from '../../data/tournamentModel'

export default function TournamentFilters({
  query,
  onQueryChange,
  filters,
  onChange,
  activeCount = 0,
  onClear,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selectClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

  useEffect(() => {
    if (!open) return undefined
    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="space-y-3" ref={rootRef}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search tournaments</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by name, location, or organizer"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Status
            <select
              className={selectClass}
              value={filters.status}
              onChange={(event) => onChange({ ...filters, status: event.target.value })}
            >
              <option value="all">All</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Registration Open">Registration Open</option>
              <option value="Registration Closed">Registration Closed</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Format
            <select
              className={selectClass}
              value={filters.format}
              onChange={(event) => onChange({ ...filters, format: event.target.value })}
            >
              <option value="all">All Formats</option>
              {TOURNAMENT_FORMATS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {activeCount ? (
        <button type="button" onClick={onClear} className="text-sm font-semibold text-emerald-700">
          Clear Filters
        </button>
      ) : null}
    </div>
  )
}
