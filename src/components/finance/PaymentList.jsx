import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { formatINR } from '../../utils/helpers'

export default function PaymentList({
  payments = [],
  statusOf,
  onRecord,
  canRecord,
  emptyAction,
}) {
  if (!payments.length) {
    return (
      <EmptyDashboardState
        icon="finance"
        title="No payment records found."
        description="Payment records will appear here after match costs or contributions are created."
        actionLabel={emptyAction?.label}
        to={emptyAction?.to}
        onClick={emptyAction?.onClick}
      />
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Player / Team</th>
              <th className="px-4 py-3">Related To</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              {canRecord ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const status = statusOf(payment)
              const recordable = ['Pending', 'Overdue', 'Pending Review'].includes(status)
              return (
                <tr key={payment.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link to={`/finance/payments/${payment.id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
                      Payment #{payment.code}
                    </Link>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{payment.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{payment.playerName || payment.teamName || '—'}</td>
                  <td className="max-w-[180px] px-4 py-3 text-slate-600">
                    <span className="line-clamp-2">{payment.matchTitle || payment.tournamentName || '—'}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatINR(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {payment.paidDate || payment.dueDate || payment.createdDate}
                  </td>
                  {canRecord ? (
                    <td className="px-4 py-3 text-right">
                      {recordable ? (
                        <button
                          type="button"
                          onClick={() => onRecord(payment)}
                          className="text-sm font-semibold text-emerald-700"
                        >
                          Record Payment
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {payments.map((payment) => {
          const status = statusOf(payment)
          const recordable = ['Pending', 'Overdue', 'Pending Review'].includes(status)
          return (
            <li key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/finance/payments/${payment.id}`} className="font-semibold text-slate-900">
                    Payment #{payment.code}
                  </Link>
                  <p className="mt-1 truncate text-sm text-slate-600">{payment.playerName || payment.teamName}</p>
                  <p className="mt-1 text-xs break-words text-slate-500">
                    {payment.matchTitle || payment.tournamentName || payment.description}
                  </p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-900">{formatINR(payment.amount)}</p>
                {canRecord && recordable ? (
                  <button
                    type="button"
                    onClick={() => onRecord(payment)}
                    className="min-h-11 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                  >
                    Record Payment
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
