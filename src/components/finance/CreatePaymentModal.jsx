import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { fieldClass } from '../../utils/helpers'
import { PAYMENT_TYPES } from '../../utils/financeAccess'
import { ROLES, TOURNAMENT_WIP } from '../../utils/constants'

const EMPTY = {
  type: 'Match Contribution',
  playerId: '',
  teamId: '',
  matchId: '',
  tournamentId: '',
  description: '',
  amount: '',
  dueDateKey: '',
}

export default function CreatePaymentModal({
  open,
  onClose,
  onSave,
  players = [],
  teams = [],
  matches = [],
  tournaments = [],
  role,
}) {
  if (!open) return null
  return (
    <CreatePaymentForm
      onClose={onClose}
      onSave={onSave}
      players={players}
      teams={teams}
      matches={matches}
      tournaments={tournaments}
      role={role}
    />
  )
}

function CreatePaymentForm({ onClose, onSave, players, teams, matches, tournaments, role }) {
  const organizer = role === ROLES.ORGANIZER
  const [form, setForm] = useState({
    ...EMPTY,
    type: organizer && !TOURNAMENT_WIP ? 'Tournament Registration' : organizer ? 'Other' : 'Match Contribution',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const types = useMemo(
    () => {
      const list = organizer ? PAYMENT_TYPES.filter((item) => item !== 'Match Contribution') : PAYMENT_TYPES
      return TOURNAMENT_WIP ? list.filter((item) => item !== 'Tournament Registration') : list
    },
    [organizer],
  )

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.description.trim()) {
      setError('Description is required.')
      return
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }
    if (form.type === 'Match Contribution' && !form.playerId) {
      setError('Select a player for this contribution.')
      return
    }
    if (form.type === 'Tournament Registration' && !form.teamId) {
      setError('Select a team for this registration fee.')
      return
    }
    setError('')
    onSave({
      ...form,
      amount: Number(form.amount),
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close dialog" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Create Payment Record</h2>
        <p className="mt-1 text-sm text-slate-500">Creates a demonstration payment record. No payment gateway is used.</p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-4 grid gap-3">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Payment Type
            <select className={`mt-1.5 ${fieldClass}`} value={form.type} onChange={(event) => update('type', event.target.value)}>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          {form.type === 'Tournament Registration' ? (
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Related Team
              <select className={`mt-1.5 ${fieldClass}`} value={form.teamId} onChange={(event) => update('teamId', event.target.value)}>
                <option value="">Select team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Related Player
              <select className={`mt-1.5 ${fieldClass}`} value={form.playerId} onChange={(event) => update('playerId', event.target.value)}>
                <option value="">Select player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                    {player.teamName ? ` · ${player.teamName}` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Related Match
            <select className={`mt-1.5 ${fieldClass}`} value={form.matchId} onChange={(event) => update('matchId', event.target.value)}>
              <option value="">None</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.title || `${match.home} vs ${match.away}`}
                </option>
              ))}
            </select>
          </label>

          {TOURNAMENT_WIP ? null : (
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Related Tournament
            <select
              className={`mt-1.5 ${fieldClass}`}
              value={form.tournamentId}
              onChange={(event) => update('tournamentId', event.target.value)}
            >
              <option value="">None</option>
              {tournaments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          )}

          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Description
            <input
              className={`mt-1.5 ${fieldClass}`}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Match Contribution"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Amount
              <input
                type="number"
                min="1"
                className={`mt-1.5 ${fieldClass}`}
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
                placeholder="750"
              />
            </label>
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Due Date
              <input
                type="date"
                className={`mt-1.5 ${fieldClass}`}
                value={form.dueDateKey}
                onChange={(event) => update('dueDateKey', event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500">
            Create Record
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
