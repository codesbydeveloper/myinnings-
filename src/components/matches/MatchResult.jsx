import { useState } from 'react'
import { RESULT_TYPES } from '../../data/grounds'
import { fieldClass } from '../../utils/helpers'

export default function MatchResult({ match, canRecord, onSave }) {
  const detail = match.resultDetail || {}
  const [form, setForm] = useState({
    winner: detail.winner || match.home,
    type: detail.type || 'Won by Runs',
    marginRuns: detail.marginRuns || '',
    marginWickets: detail.marginWickets || '',
    summary: detail.summary || match.result || '',
  })

  if (match.status !== 'Completed' && match.status !== 'Cancelled' && !canRecord) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="font-semibold text-slate-800">Result pending</p>
        <p className="mt-1 text-sm text-slate-500">
          Match result will be available after the match is completed.
        </p>
      </div>
    )
  }

  if (!canRecord && (match.result || detail.summary)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">{match.result || detail.summary}</p>
        <p className="mt-2 text-sm text-slate-500">{form.type}</p>
      </div>
    )
  }

  if (!canRecord) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="font-semibold text-slate-800">Result pending</p>
        <p className="mt-1 text-sm text-slate-500">
          Match result will be available after the match is completed.
        </p>
      </div>
    )
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault()
        onSave(form)
      }}
    >
      <label className="block text-sm font-medium text-slate-700">
        Winning Team
        <select
          className={`mt-1.5 ${fieldClass}`}
          value={form.winner}
          onChange={(event) => setForm((current) => ({ ...current, winner: event.target.value }))}
        >
          <option value={match.home}>{match.home}</option>
          <option value={match.away}>{match.away}</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Result Type
        <select
          className={`mt-1.5 ${fieldClass}`}
          value={form.type}
          onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
        >
          {RESULT_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {form.type === 'Won by Runs' ? (
        <label className="block text-sm font-medium text-slate-700">
          Runs margin
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={form.marginRuns}
            onChange={(event) => setForm((current) => ({ ...current, marginRuns: event.target.value }))}
          />
        </label>
      ) : null}
      {form.type === 'Won by Wickets' ? (
        <label className="block text-sm font-medium text-slate-700">
          Wickets margin
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={form.marginWickets}
            onChange={(event) =>
              setForm((current) => ({ ...current, marginWickets: event.target.value }))
            }
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-slate-700">
        Match summary
        <textarea
          rows={3}
          className={`mt-1.5 ${fieldClass}`}
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          placeholder="Mumbai Warriors won by 24 runs"
        />
      </label>
      <button
        type="submit"
        className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white"
      >
        Save Result
      </button>
    </form>
  )
}
