import { Link } from 'react-router-dom'
import ReportActions from '../../components/reports/ReportActions'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import MatchTrendChart from '../../components/reports/MatchTrendChart'
import { useReportData } from '../../hooks/useReportData'
import { canAccessReport } from '../../utils/reportAccess'
import { downloadCsv, money } from '../../utils/reportUtils'
import { ROLES } from '../../utils/constants'

export default function ReportsOverview() {
  const data = useReportData()
  const role = data.user?.role
  const player = role === ROLES.PLAYER

  const cards = player
    ? [
        { label: 'Matches played', value: data.playerStats?.played || 0, icon: 'matches' },
        { label: 'Squad selections', value: data.playerStats?.selected || 0, icon: 'players' },
        { label: 'Availability rate', value: `${data.playerStats?.availabilityRate || 0}%`, icon: 'clipboard' },
        { label: 'Pending payments', value: money(data.finance.pending + data.finance.overdue), icon: 'finance' },
      ]
    : [
        { label: 'Total Matches', value: data.overview.total, icon: 'matches' },
        { label: 'Completed Matches', value: data.overview.completed, icon: 'check' },
        { label: 'Active Tournaments', value: data.tournamentOverview.active, icon: 'tournaments' },
        { label: 'Total Players', value: data.players.length, icon: 'players' },
        { label: 'Total Collected', value: money(data.finance.collected), icon: 'finance' },
        { label: 'Pending Payments', value: money(data.finance.pending + data.finance.overdue), icon: 'finance' },
        { label: 'Total Ground Bookings', value: data.bookingCounts.total, icon: 'grounds' },
        { label: 'Upcoming Matches', value: data.overview.upcoming, icon: 'clock' },
      ]

  function handleExport() {
    downloadCsv(
      'myinnings-overview-report.csv',
      cards.map((item) => ({ label: item.label, value: item.value })),
      [
        { label: 'Metric', value: (row) => row.label },
        { label: 'Value', value: (row) => row.value },
      ],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <ReportStatCard key={card.label} {...card} />
        ))}
      </div>
      <ReportSection title="Match trend">
        <MatchTrendChart data={data.matchTrend} />
      </ReportSection>
      <div className="no-print grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {canAccessReport(role, 'matches') ? <Jump to="/reports/matches" label="Match Reports" /> : null}
        {canAccessReport(role, 'teams') ? <Jump to="/reports/teams" label="Team Reports" /> : null}
        {canAccessReport(role, 'players') ? <Jump to="/reports/players" label="Player Reports" /> : null}
        {canAccessReport(role, 'tournaments') ? <Jump to="/reports/tournaments" label="Tournament Reports" /> : null}
        {canAccessReport(role, 'finance') ? <Jump to="/reports/finance" label="Finance Reports" /> : null}
        {canAccessReport(role, 'grounds') ? <Jump to="/reports/grounds" label="Ground Reports" /> : null}
      </div>
    </div>
  )
}

function Jump({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-300 hover:text-emerald-800"
    >
      {label}
    </Link>
  )
}
