import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icons'

const FILTERS = [
  { id: 'all', label: 'All Teams' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'mine', label: 'My Teams' },
]

export default function TeamFilters({ query, onQueryChange, filter, onFilterChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const active = FILTERS.find((item) => item.id === filter) ?? FILTERS[0]

  useEffect(() => {
    if (!open) return undefined

    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search teams</span>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Icon name="search" className="h-4 w-4" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by team, location, or captain"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 pl-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>

      <div className="relative sm:w-44" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Icon name="filter" className="h-4 w-4" />
          {active.label}
        </button>
        {open ? (
          <div className="absolute right-0 z-20 mt-1 w-full min-w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onFilterChange(item.id)
                  setOpen(false)
                }}
                className={`flex w-full px-3 py-2.5 text-left text-sm ${
                  item.id === filter
                    ? 'bg-emerald-50 font-semibold text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
