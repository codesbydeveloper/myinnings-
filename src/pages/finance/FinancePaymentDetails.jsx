import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import Icon from '../../components/common/Icons'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import RecordPaymentModal from '../../components/finance/RecordPaymentModal'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useToast } from '../../context/ToastContext'
import { formatINR, simulateRequest } from '../../utils/helpers'
import { ROLES } from '../../utils/constants'
import { canRecordPayment } from '../../utils/financeAccess'

export default function FinancePaymentDetails() {
  const { paymentId } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { payments, allPayments, effectiveStatus, recordPayment, updatePaymentStatus } = useFinance()
  const [recording, setRecording] = useState(false)

  const visible = payments.find((item) => item.id === paymentId)
  const exists = allPayments.some((item) => item.id === paymentId)

  const status = visible ? effectiveStatus(visible) : null
  const recordable = visible && ['Pending', 'Overdue', 'Pending Review'].includes(status)
  const canRecord = canRecordPayment(user) && user?.role !== ROLES.PLAYER

  const rows = useMemo(() => {
    if (!visible) return []
    return [
      ['Payment ID', visible.code],
      ['Player / Team', visible.playerName || visible.teamName || '—'],
      ['Related Match', visible.matchTitle || '—'],
      ['Related Tournament', visible.tournamentName || '—'],
      ['Description', visible.description],
      ['Amount', formatINR(visible.amount)],
      ['Status', status],
      ['Due Date', visible.dueDate || '—'],
      ['Payment Date', visible.paidDate || '—'],
      ['Payment Method', visible.method || '—'],
      ['Reference', visible.reference || '—'],
      ['Created Date', visible.createdDate || '—'],
      ['Created By', visible.createdBy || '—'],
    ]
  }, [status, visible])

  if (!visible && exists) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to view this payment record."
        to={user?.role === ROLES.PLAYER ? '/finance' : '/finance/payments'}
        actionLabel="Back to Payments"
      />
    )
  }

  if (!visible) {
    return (
      <EmptyDashboardState
        icon="finance"
        title="Payment not found"
        description="This payment record is unavailable."
        actionLabel="Back to Payments"
        to="/finance/payments"
      />
    )
  }

  async function confirmRecord({ method, reference }) {
    await simulateRequest(280)
    recordPayment(visible.id, { method, reference })
    setRecording(false)
    showToast('Payment recorded successfully. No real money was processed.')
  }

  return (
    <div className="space-y-5">
      <Link to="/finance/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        Back to Payments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Payment #{visible.code}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{visible.description}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {visible.playerName || visible.teamName} · {visible.matchTitle || visible.tournamentName || 'General'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {canRecord && recordable ? (
              <button
                type="button"
                onClick={() => setRecording(true)}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
              >
                Record Payment
              </button>
            ) : null}
            {canRecord && recordable ? (
              <button
                type="button"
                onClick={() => {
                  updatePaymentStatus(visible.id, 'Cancelled')
                  showToast('Payment marked as cancelled.')
                }}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Cancel Record
              </button>
            ) : null}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
              <dd className="mt-1 text-sm font-semibold break-words text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {recording ? (
        <RecordPaymentModal payment={visible} onClose={() => setRecording(false)} onConfirm={confirmRecord} />
      ) : null}
    </div>
  )
}
