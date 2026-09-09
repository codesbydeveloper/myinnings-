import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { fieldClass, formatINR } from '../../utils/helpers'
import { PAYMENT_METHODS } from '../../utils/financeAccess'

export default function RecordPaymentModal({ payment, onClose, onConfirm }) {
  const [method, setMethod] = useState('UPI')
  const [reference, setReference] = useState('')

  useEffect(() => {
    if (!payment) return undefined
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
  }, [onClose, payment])

  if (!payment) return null

  const related = payment.matchTitle || payment.tournamentName || payment.teamName || '—'

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">Record Payment</h2>
        <p className="mt-1 text-sm text-slate-500">This is a demonstration payment. No real money is processed.</p>

        <dl className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
          <Row label="Player" value={payment.playerName || payment.teamName || '—'} />
          <Row label="Amount" value={formatINR(payment.amount)} />
          <Row label="Related To" value={related} />
        </dl>

        <label className="mt-4 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Payment Method
          <select className={`mt-1.5 ${fieldClass}`} value={method} onChange={(event) => setMethod(event.target.value)}>
            {PAYMENT_METHODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Transaction Reference
          <input
            className={`mt-1.5 ${fieldClass}`}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ method, reference })}
            className="min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="max-w-[70%] text-right text-sm font-semibold break-words text-slate-800">{value}</dd>
    </div>
  )
}
