import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReportActions from '../../components/reports/ReportActions'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import { useReportData } from '../../hooks/useReportData'
import { computeStandings } from '../../data/tournamentModel'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { downloadCsv } from '../../utils/reportUtils'

export default function TournamentReports() {
  const data = useReportData()
  const { matches } = useMatches()
  const { teams } = useTeams()
  const [tournamentId, setTournamentId] = useState(data.allVisibleTournaments[0]?.id || 'all')

  const selected =
    tournamentId === 'all'
      ? null
      : data.allVisibleTournaments.find((item) => item.id === tournamentId) || null
  const progress = selected
    ? data.tournamentRows.find((item) => item.id === selected.id)?.progress
    : null
  const standings = useMemo(
    () => (selected ? computeStandings(teams, matches, selected) : []),
    [matches, selected, teams],
  )

  const exportRows = selected
    ? [
        {
          name: selected.name,
          registered: progress?.registered || 0,
          approved: progress?.approved || 0,
          matches: progress?.totalMatches || 0,
          completed: progress?.completed || 0,
          remaining: progress?.remaining || 0,
        },
      ]
    : data.tournamentRows.map((item) => ({
        name: item.name,
        registered: item.progress.registered,
        approved: item.progress.approved,
        matches: item.progress.totalMatches,
        completed: item.progress.completed,
        remaining: item.progress.remaining,
      }))

  function handleExport() {
    downloadCsv('myinnings-tournament-report.csv', exportRows, [
      { label: 'Tournament', value: (row) => row.name },
      { label: 'Registered Teams', value: (row) => row.registered },
      { label: 'Approved Teams', value: (row) => row.approved },
      { label: 'Total Matches', value: (row) => row.matches },
      { label: 'Completed', value: (row) => row.completed },
      { label: 'Remaining', value: (row) => row.remaining },
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Total Tournaments" value={data.tournamentOverview.total} icon="tournaments" />
        <ReportStatCard label="Upcoming" value={data.tournamentOverview.upcoming} icon="clock" />
        <ReportStatCard label="Active" value={data.tournamentOverview.active} icon="matches" />
        <ReportStatCard label="Completed" value={data.tournamentOverview.completed} icon="check" />
      </div>
      <ReportFilters
        filters={[
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
      {selected && progress ? (
        <>
          <ReportSection
            title={selected.name}
            action={
              <Link to={`/tournaments/${selected.id}`} className="text-sm font-semibold text-emerald-700">
                Open tournament
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
              <Mini label="Registered Teams" value={progress.registered} />
              <Mini label="Approved Teams" value={progress.approved} />
              <Mini label="Total Matches" value={progress.totalMatches} />
              <Mini label="Completed Matches" value={progress.completed} />
              <Mini label="Remaining" value={progress.remaining} />
              <Mini label="Progress" value={`${progress.progress}%`} />
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Tournament progress: {progress.totalMatches} Matches · {progress.completed} Completed · {progress.remaining} Remaining
            </p>
          </ReportSection>
          <ReportSection title="Team performance">
            <ReportTable
              rows={standings.map((row) => ({ ...row, id: row.teamId }))}
              emptyTitle="NO MATCH DATA"
              emptyDescription="No matches are available for the selected period."
              columns={[
                { id: 'teamName', label: 'Team' },
                { id: 'played', label: 'Played' },
                { id: 'won', label: 'Wins' },
                { id: 'lost', label: 'Losses' },
                { id: 'draw', label: 'Draws' },
                { id: 'points', label: 'Points' },
              ]}
            />
          </ReportSection>
        </>
      ) : (
        <ReportSection title="Tournaments">
          <ReportTable
            rows={data.tournamentRows}
            emptyTitle="No tournament data"
            emptyDescription="No tournaments were found for the selected period."
            columns={[
              {
                id: 'name',
                label: 'Tournament',
                render: (row) => (
                  <Link to={`/tournaments/${row.id}`} className="font-semibold text-emerald-700">
                    {row.name}
                  </Link>
                ),
              },
              { id: 'status', label: 'Status' },
              { id: 'registered', label: 'Registered', render: (row) => row.progress.registered },
              { id: 'approved', label: 'Approved', render: (row) => row.progress.approved },
              { id: 'matches', label: 'Matches', render: (row) => row.progress.totalMatches },
              { id: 'completed', label: 'Completed', render: (row) => row.progress.completed },
            ]}
          />
        </ReportSection>
      )}
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
