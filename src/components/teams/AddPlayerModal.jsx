import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../common/Icons'
import UserAvatar from '../common/UserAvatar'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'

export default function AddPlayerModal({
  teamName,
  players = [],
  onClose,
  onAdd,
  saving = false,
}) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return players
    return players.filter((player) =>
      [player.name, player.position, player.teamName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    )
  }, [players, query])

  function toggle(id) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55"
        aria-label="Close add player dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-player-title"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="add-player-title" className="text-lg font-semibold text-slate-900">
                Add Players
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select existing players to add to {teamName}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          <label className="relative mt-4 block">
            <span className="sr-only">Search players</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or position"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3">
          {filtered.length === 0 ? (
            <EmptyDashboardState
              icon="players"
              title="No players found"
              description="There are no matching players available to add."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((player) => {
                const checked = selected.includes(player.id)
                return (
                  <li key={player.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(player.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <UserAvatar name={player.name} className="h-10 w-10 text-xs" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {player.name}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {player.position}
                          {player.teamName ? ` · ${player.teamName}` : ' · Unassigned'}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected.length || saving}
            onClick={() => onAdd(selected)}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Adding...' : selected.length ? `Add ${selected.length} ${selected.length === 1 ? 'Player' : 'Players'}` : 'Add Players'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
