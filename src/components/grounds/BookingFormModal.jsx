import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fieldClass } from '../../utils/helpers'
import { BOOKING_TYPES, todayKey, toInputTime } from '../../data/groundModel'
import { allowedBookingTypes } from '../../utils/groundAccess'
import { TOURNAMENT_WIP } from '../../utils/constants'

const EMPTY = {
  dateKey: todayKey(),
  startInput: '10:00',
  endInput: '13:00',
  type: 'Practice',
  matchId: '',
  tournamentId: '',
  notes: '',
}

export default function BookingFormModal({
  open,
  ground,
  grounds = [],
  matches = [],
  tournaments = [],
  role,
  onClose,
  onSave,
  lockGround = false,
}) {
  if (!open) return null
  return (
    <BookingForm
      ground={ground}
      grounds={grounds}
      matches={matches}
      tournaments={tournaments}
      role={role}
      onClose={onClose}
      onSave={onSave}
      lockGround={lockGround}
    />
  )
}

function BookingForm({ ground, grounds, matches, tournaments, role, onClose, onSave, lockGround }) {
  const types = allowedBookingTypes(role)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    ...EMPTY,
    groundId: ground?.id || '',
    type: types[0] || 'Practice',
  })

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

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.groundId) {
      setError('Select a ground.')
      return
    }
    if (!form.dateKey) {
      setError('Match date cannot be empty.')
      return
    }
    if (!form.startInput || !form.endInput) {
      setError('Enter a start and end time.')
      return
    }
    if (form.endInput <= form.startInput) {
      setError('End time must be after start time.')
      return
    }
    setError('')
    onSave({
      groundId: form.groundId,
      dateKey: form.dateKey,
      startTime: toInputTime(form.startInput),
      endTime: toInputTime(form.endInput),
      startInput: form.startInput,
      endInput: form.endInput,
      type: form.type,
      matchId: form.matchId || null,
      tournamentId: form.tournamentId || null,
      notes: form.notes,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close dialog" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Create Booking</h2>
        <p className="mt-1 text-sm text-slate-500">Demo booking only. Conflicts are checked against existing reservations.</p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-4 grid gap-3">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Ground
            <select
              className={`mt-1.5 ${fieldClass}`}
              value={form.groundId}
              onChange={(event) => update('groundId', event.target.value)}
              disabled={lockGround}
            >
              <option value="">Select ground</option>
              {grounds.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Date
            <input
              type="date"
              className={`mt-1.5 ${fieldClass}`}
              value={form.dateKey}
              onChange={(event) => update('dateKey', event.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Start Time
              <input
                type="time"
                className={`mt-1.5 ${fieldClass}`}
                value={form.startInput}
                onChange={(event) => update('startInput', event.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              End Time
              <input
                type="time"
                className={`mt-1.5 ${fieldClass}`}
                value={form.endInput}
                onChange={(event) => update('endInput', event.target.value)}
              />
            </label>
          </div>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Booking Type
            <select className={`mt-1.5 ${fieldClass}`} value={form.type} onChange={(event) => update('type', event.target.value)}>
              {(types.length ? types : BOOKING_TYPES)
                .filter((item) => !TOURNAMENT_WIP || item !== 'Tournament')
                .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
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
            Notes
            <textarea
              rows={3}
              className={`mt-1.5 ${fieldClass}`}
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold">
            Cancel
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            Create Booking
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
