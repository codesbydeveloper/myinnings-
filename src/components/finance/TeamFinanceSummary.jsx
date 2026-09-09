import { Link } from 'react-router-dom'
import SectionCard from '../dashboard/SectionCard'
import { formatINR } from '../../utils/helpers'

export default function TeamFinanceSummary({ team, summary, compact = false }) {
  if (!team || !summary) return null

  return (
    <SectionCard
      title={`${team.name} Finance`}
      action={
        compact ? null : (
          <Link to="/finance" className="text-sm font-semibold text-emerald-700">
            View Finance
          </Link>
        )
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Collected" value={formatINR(summary.collected)} tone="text-emerald-700" />
        <Stat label="Pending" value={formatINR(summary.pending)} tone="text-amber-700" />
        <Stat label="Expenses" value={formatINR(summary.expenses)} />
        <Stat label="Net Balance" value={formatINR(summary.net)} />
      </div>
    </SectionCard>
  )
}

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
