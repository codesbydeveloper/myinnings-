import { Link } from 'react-router-dom'
import SectionCard from './SectionCard'

export default function FinancialOverview({ finance }) {
  if (!finance?.items?.length) return null

  return (
    <SectionCard
      title="Financial Overview"
      action={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={finance.reportsTo || '/reports/finance'}
            className="text-sm font-medium text-emerald-700"
          >
            View Full Reports
          </Link>
          <Link to={finance.viewTo} className="text-sm font-medium text-slate-500">
            View Finance
          </Link>
        </div>
      }
    >
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${finance.items.length > 3 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
        {finance.items.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
