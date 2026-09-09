import StatusBadge from './StatusBadge'
import EmptyDashboardState from './EmptyDashboardState'
import SectionCard from './SectionCard'

function formatAmount(transaction) {
  const value = `₹${transaction.amount.toLocaleString('en-IN')}`
  if (transaction.type === 'in') return `+${value}`
  return `-${value}`
}

export default function RecentTransactions({ transactions = [] }) {
  return (
    <SectionCard title="Recent Transactions">
      {transactions.length === 0 ? (
        <EmptyDashboardState
          icon="finance"
          title="No transactions yet"
          description="Match fees and expenses will show up here."
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {transactions.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {item.category} · {item.date}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    item.type === 'in' ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {formatAmount(item)}
                </p>
                <StatusBadge status={item.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
