import { formatINR } from '../../utils/helpers'

const CARDS = [
  { key: 'collected', label: 'Total Collected', tone: 'text-emerald-700' },
  { key: 'pending', label: 'Total Pending', tone: 'text-amber-700' },
  { key: 'expenses', label: 'Total Expenses', tone: 'text-slate-800' },
  { key: 'net', label: 'Net Balance', tone: 'text-slate-900' },
]

export default function FinanceSummaryCards({ summary, variant = 'default' }) {
  const items =
    variant === 'player'
      ? [
          { key: 'collected', label: 'Total Paid', tone: 'text-emerald-700' },
          { key: 'pending', label: 'Total Pending', tone: 'text-amber-700' },
        ]
      : variant === 'tournament'
        ? [
            { key: 'collected', label: 'Total Tournament Income', tone: 'text-emerald-700' },
            { key: 'pending', label: 'Pending Fees', tone: 'text-amber-700' },
            { key: 'expenses', label: 'Total Tournament Expenses', tone: 'text-slate-800' },
            { key: 'net', label: 'Net Tournament Balance', tone: 'text-slate-900' },
          ]
        : CARDS

  const values = {
    collected: summary?.collected ?? summary?.income ?? 0,
    pending: summary?.pending ?? 0,
    expenses: summary?.expenses ?? 0,
    net: summary?.net ?? 0,
  }

  return (
    <section className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${items.length > 2 ? 'xl:grid-cols-4' : ''}`}>
      {items.map((item) => (
        <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{item.label}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${item.tone}`}>
            {formatINR(values[item.key])}
          </p>
        </div>
      ))}
    </section>
  )
}
