import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fieldClass } from '../../utils/helpers'
import { todayKey, toInputTime } from '../../data/groundModel'

export default function AvailabilityModal({ open, ground, grounds = [], onClose, onCheck, result }) {
  if (!open) return null
  return (
    <AvailabilityForm
      ground={ground}
      grounds={grounds}
      onClose={onClose}
      onCheck={onCheck}
      result={result}
    />
  )
}

function AvailabilityForm({ ground, grounds, onClose, onCheck, result }) {
  const [form, setForm] = useState({
    groundId: ground?.id || '',
    dateKey: todayKey(),
    startInput: '10:00',
    endInput: '13:00',
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
    onCheck({
      groundId: form.groundId,
      dateKey: form.dateKey,
      startTime: toInputTime(form.startInput),
      endTime: toInputTime(form.endInput),
      startInput: form.startInput,
      endInput: form.endInput,
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close dialog" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Check Availability</h2>
        <div className="mt-4 grid gap-3">
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Ground
            <select
              className={`mt-1.5 ${fieldClass}`}
              value={form.groundId}
              onChange={(event) => update('groundId', event.target.value)}
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
          <div className="grid grid-cols-2 gap-3">
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
        </div>

        {result ? (
          <div
            className={`mt-4 rounded-2xl p-4 text-sm font-semibold ${
              result.available ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            <p>{result.available ? '✓ Ground Available' : '✕ Ground Already Booked'}</p>
            <p className="mt-1 text-sm font-medium leading-5">{result.message}</p>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold">
            Close
          </button>
          <button type="submit" className="min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            Check Availability
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
