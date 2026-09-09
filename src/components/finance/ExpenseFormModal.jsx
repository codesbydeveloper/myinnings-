import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fieldClass } from '../../utils/helpers'
import { EXPENSE_CATEGORIES } from '../../utils/financeAccess'
import { todayKey } from '../../data/financeModel'
import { ROLES, TOURNAMENT_WIP } from '../../utils/constants'

function emptyForm() {
  return {
    description: '',
    category: 'Ground',
    amount: '',
    dateKey: todayKey(),
    matchId: '',
    tournamentId: '',
    notes: '',
  }
}

export default function ExpenseFormModal({
  open,
  expense,
  onClose,
  onSave,
  matches = [],
  tournaments = [],
  role,
}) {
  if (!open) return null
  return (
    <ExpenseForm
      expense={expense}
      onClose={onClose}
      onSave={onSave}
      matches={matches}
      tournaments={tournaments}
      role={role}
    />
  )
}

function ExpenseForm({ expense, onClose, onSave, matches, tournaments, role }) {
  const [form, setForm] = useState(() =>
    expense
      ? {
          description: expense.description || '',
          category: expense.category || 'Other',
          amount: String(expense.amount || ''),
          dateKey: expense.dateKey || todayKey(),
          matchId: expense.matchId || '',
          tournamentId: expense.tournamentId || '',
          notes: expense.notes || '',
        }
      : emptyForm(),
  )
  const lockedMatch = expense?.source === 'match'
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
    if (role === ROLES.ORGANIZER && !TOURNAMENT_WIP && !form.matchId && !form.tournamentId && !expense) {
      setError('Select a match or tournament for this expense.')
      return
    }
    setError('')
    onSave({
      ...form,
      amount: Number(form.amount),
      matchId: lockedMatch ? expense.matchId : form.matchId,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close dialog" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">{expense ? 'Edit Expense' : 'Add Expense'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {lockedMatch
            ? 'This expense is linked to match costs and will update the match record.'
            : 'Record a demonstration expense. Totals update immediately.'}
        </p>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-4 grid gap-3">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Description
            <input
              className={`mt-1.5 ${fieldClass}`}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Ground Fee"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Category
              <select
                className={`mt-1.5 ${fieldClass}`}
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
                disabled={lockedMatch}
              >
                {EXPENSE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Amount
              <input
                type="number"
                min="1"
                className={`mt-1.5 ${fieldClass}`}
                value={form.amount}
                onChange={(event) => update('amount', event.target.value)}
              />
            </label>
          </div>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Date
            <input
              type="date"
              className={`mt-1.5 ${fieldClass}`}
              value={form.dateKey}
              onChange={(event) => update('dateKey', event.target.value)}
              disabled={lockedMatch}
            />
          </label>
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Related Match
            <select
              className={`mt-1.5 ${fieldClass}`}
              value={form.matchId}
              onChange={(event) => update('matchId', event.target.value)}
              disabled={lockedMatch || Boolean(expense)}
            >
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
              disabled={lockedMatch}
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
              className={`mt-1.5 ${fieldClass}`}
              rows={3}
              value={form.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Optional"
            />
          </label>
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
            {expense ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
