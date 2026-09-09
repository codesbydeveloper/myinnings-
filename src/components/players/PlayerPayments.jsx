import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { formatINR } from '../../utils/helpers'
import { Link } from 'react-router-dom'

export default function PlayerPayments({ payments = [] }) {
  const totalPaid = payments
    .filter((item) => item.status === 'Paid')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalPending = payments
    .filter((item) => item.status === 'Pending' || item.status === 'Overdue')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  if (!payments.length) {
    return (
      <EmptyDashboardState
        icon="finance"
        title="No Payment Records"
        description="No payment history is available yet."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Total Paid</p>
          <p className="mt-2 text-xl font-semibold text-emerald-700">{formatINR(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Total Pending</p>
          <p className="mt-2 text-xl font-semibold text-amber-700">{formatINR(totalPending)}</p>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Match / Event</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.href ? (
                    <Link to={item.href} className="hover:text-emerald-700">
                      {item.description}
                    </Link>
                  ) : (
                    item.description
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.event}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{formatINR(item.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{item.date}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {payments.map((item) => (
          <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {item.href ? (
                    <Link to={item.href}>{item.description}</Link>
                  ) : (
                    item.description
                  )}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.event}</p>
                <p className="mt-1 text-xs text-slate-400">{item.date}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-900">{formatINR(item.amount)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
