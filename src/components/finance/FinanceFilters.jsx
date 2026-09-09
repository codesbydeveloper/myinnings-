import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icons'
import { DATE_FILTERS } from '../../data/financeModel'
import { PAYMENT_STATUSES, PAYMENT_TYPES } from '../../utils/financeAccess'

export default function FinanceFilters({
  query,
  onQueryChange,
  placeholder = 'Search',
  filters,
  onChange,
  onClear,
  activeCount = 0,
  showType = false,
  showStatus = false,
  showDate = true,
  extra = null,
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
          <span className="sr-only">Search</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
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
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          {showStatus ? (
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Status
              <select
                className={selectClass}
                value={filters.status}
                onChange={(event) => onChange({ ...filters, status: event.target.value })}
              >
                <option value="all">All</option>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showType ? (
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Type
              <select
                className={selectClass}
                value={filters.type}
                onChange={(event) => onChange({ ...filters, type: event.target.value })}
              >
                <option value="all">All</option>
                {PAYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {showDate ? (
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Date
              <select
                className={selectClass}
                value={filters.date}
                onChange={(event) => onChange({ ...filters, date: event.target.value })}
              >
                {DATE_FILTERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {extra}
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
