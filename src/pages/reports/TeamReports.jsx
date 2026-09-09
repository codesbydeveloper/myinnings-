import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReportActions from '../../components/reports/ReportActions'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import TeamCompareChart from '../../components/reports/TeamCompareChart'
import { useReportData } from '../../hooks/useReportData'
import { downloadCsv, teamMatchRecord } from '../../utils/reportUtils'

export default function TeamReports() {
  const data = useReportData()
  const [teamId, setTeamId] = useState('all')

  const rows = useMemo(() => {
    if (teamId === 'all') return data.teamRows
    return data.teamRows.filter((item) => item.teamId === teamId)
  }, [data.teamRows, teamId])

  const selected = teamId === 'all' ? null : data.teams.find((team) => team.id === teamId)
  const detail = selected ? teamMatchRecord(selected, data.matches) : null

  function handleExport() {
    downloadCsv('myinnings-team-report.csv', rows, [
      { label: 'Team', value: (row) => row.teamName },
      { label: 'Total Matches', value: (row) => row.totalMatches },
      { label: 'Wins', value: (row) => row.wins },
      { label: 'Losses', value: (row) => row.losses },
      { label: 'Win Percentage', value: (row) => `${row.winPercentage}%` },
      { label: 'Active Players', value: (row) => row.activePlayers },
      { label: 'Average Squad Size', value: (row) => row.averageSquadSize },
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <ReportFilters
        filters={[
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
        ]}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Teams" value={rows.length} icon="teams" />
        <ReportStatCard label="Total Matches" value={rows.reduce((sum, row) => sum + row.totalMatches, 0)} icon="matches" />
        <ReportStatCard label="Wins" value={rows.reduce((sum, row) => sum + row.wins, 0)} icon="check" />
        <ReportStatCard
          label="Average win rate"
          value={`${rows.length ? Math.round(rows.reduce((sum, row) => sum + row.winPercentage, 0) / rows.length) : 0}%`}
          icon="trophy"
        />
      </div>
      <ReportSection title="Team performance comparison">
        <TeamCompareChart data={rows} />
      </ReportSection>
      <ReportSection title="Team performance">
        <ReportTable
          rows={rows.map((row) => ({ ...row, id: row.teamId }))}
          onRowClick={(row) => setTeamId(row.teamId)}
          emptyTitle="NO MATCH DATA"
          emptyDescription="No matches are available for the selected period."
          columns={[
            { id: 'teamName', label: 'Team Name' },
            { id: 'totalMatches', label: 'Total Matches' },
            { id: 'wins', label: 'Wins' },
            { id: 'losses', label: 'Losses' },
            { id: 'winPercentage', label: 'Win Percentage', render: (row) => `${row.winPercentage}%` },
            { id: 'activePlayers', label: 'Active Players' },
            { id: 'averageSquadSize', label: 'Average Squad Size' },
          ]}
        />
      </ReportSection>
      {detail ? (
        <ReportSection
          title={`${selected.name} details`}
          action={
            <Link to={`/teams/${selected.id}`} className="text-sm font-semibold text-emerald-700">
              Open team
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Played" value={detail.played} />
            <Mini label="Wins" value={detail.wins} />
            <Mini label="Losses" value={detail.losses} />
            <Mini label="Win rate" value={`${detail.winPercentage}%`} />
          </div>
        </ReportSection>
      ) : null}
    </div>
  )
}

function Mini({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
