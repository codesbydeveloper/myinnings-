import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DistributionChart from '../../components/reports/DistributionChart'
import MatchTrendChart from '../../components/reports/MatchTrendChart'
import ReportActions from '../../components/reports/ReportActions'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import StatusBadge from '../../components/dashboard/StatusBadge'
import { useReportData } from '../../hooks/useReportData'
import { downloadCsv, isDrawnMatch, matchWinner } from '../../utils/reportUtils'

export default function MatchReports() {
  const data = useReportData()
  const [status, setStatus] = useState('all')
  const [teamId, setTeamId] = useState('all')
  const [tournamentId, setTournamentId] = useState('all')

  const rows = useMemo(() => {
    return data.matches.filter((match) => {
      if (status !== 'all' && match.status !== status) return false
      if (teamId !== 'all' && match.homeTeamId !== teamId && match.awayTeamId !== teamId) return false
      if (tournamentId !== 'all' && match.tournamentId !== tournamentId) return false
      return true
    })
  }, [data.matches, status, teamId, tournamentId])

  const wins = rows.filter((match) => match.status === 'Completed' && matchWinner(match) && !isDrawnMatch(match)).length
  const draws = rows.filter((match) => isDrawnMatch(match)).length
  const losses = rows.filter((match) => match.status === 'Completed' && !isDrawnMatch(match) && !matchWinner(match)).length

  function handleExport() {
    downloadCsv(
      'myinnings-match-report.csv',
      rows,
      [
        { label: 'Match', value: (row) => row.title || `${row.home} vs ${row.away}` },
        { label: 'Date', value: (row) => row.date },
        { label: 'Teams', value: (row) => `${row.home} vs ${row.away}` },
        { label: 'Ground', value: (row) => row.venue || row.ground?.name || '' },
        { label: 'Status', value: (row) => row.status },
        { label: 'Result', value: (row) => row.result || row.resultDetail?.summary || '' },
      ],
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Total Matches" value={rows.length} icon="matches" />
        <ReportStatCard label="Upcoming Matches" value={rows.filter((item) => item.status === 'Upcoming' || item.status === 'Live').length} icon="clock" />
        <ReportStatCard label="Completed Matches" value={rows.filter((item) => item.status === 'Completed').length} icon="check" />
        <ReportStatCard label="Cancelled Matches" value={rows.filter((item) => item.status === 'Cancelled').length} icon="alert" />
      </div>
      <ReportFilters
        filters={[
          {
            id: 'status',
            label: 'Match status',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'all', label: 'All statuses' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'Live', label: 'Live' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ],
          },
          {
            id: 'team',
            label: 'Team',
            value: teamId,
            onChange: setTeamId,
            options: [
              { value: 'all', label: 'All teams' },
              ...data.teams.map((team) => ({ value: team.id, label: team.name })),
            ],
          },
          {
            id: 'tournament',
            label: 'Tournament',
            value: tournamentId,
            onChange: setTournamentId,
            options: [
              { value: 'all', label: 'All tournaments' },
              ...data.allVisibleTournaments.map((item) => ({ value: item.id, label: item.name })),
            ],
          },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportSection title="Match trend">
          <MatchTrendChart data={data.matchTrend} />
        </ReportSection>
        <ReportSection title="Match status distribution">
          <DistributionChart
            data={[
              { name: 'Upcoming', value: rows.filter((item) => item.status === 'Upcoming' || item.status === 'Live').length },
              { name: 'Completed', value: rows.filter((item) => item.status === 'Completed').length },
              { name: 'Cancelled', value: rows.filter((item) => item.status === 'Cancelled').length },
            ]}
            emptyTitle="NO MATCH DATA"
            emptyDescription="No matches are available for the selected period."
          />
        </ReportSection>
      </div>
      <ReportSection title="Match performance">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Mini label="Wins" value={wins} />
          <Mini label="Losses" value={Math.max(rows.filter((item) => item.status === 'Completed').length - wins - draws, 0) || losses} />
          <Mini label="Draws" value={draws} />
        </div>
      </ReportSection>
      <ReportSection title="Recent matches">
        <ReportTable
          rows={rows}
          emptyTitle="NO MATCH DATA"
          emptyDescription="No matches are available for the selected period."
          columns={[
            {
              id: 'match',
              label: 'Match',
              render: (row) => (
                <Link to={`/matches/${row.id}`} className="font-semibold text-emerald-700">
                  {row.title || `${row.home} vs ${row.away}`}
                </Link>
              ),
            },
            { id: 'date', label: 'Date' },
            { id: 'teams', label: 'Teams', render: (row) => `${row.home} vs ${row.away}` },
            { id: 'ground', label: 'Ground', render: (row) => row.venue || row.ground?.name || '—' },
            { id: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { id: 'result', label: 'Result', render: (row) => row.result || row.resultDetail?.summary || '—' },
          ]}
        />
      </ReportSection>
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
