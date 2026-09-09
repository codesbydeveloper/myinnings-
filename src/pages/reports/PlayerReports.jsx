import { useMemo, useState } from 'react'
import AvailabilityChart from '../../components/reports/AvailabilityChart'
import ReportActions from '../../components/reports/ReportActions'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import { useReportData } from '../../hooks/useReportData'
import { ROLES } from '../../utils/constants'
import { availabilityBreakdown, downloadCsv, playerPerformance } from '../../utils/reportUtils'

export default function PlayerReports() {
  const data = useReportData()
  const isPlayer = data.user?.role === ROLES.PLAYER
  const [teamId, setTeamId] = useState('all')
  const [playerId, setPlayerId] = useState(isPlayer ? data.ownPlayer?.id || 'all' : 'all')

  const scopedPlayers = useMemo(() => {
    return data.players.filter((player) => {
      if (isPlayer) return player.id === data.ownPlayer?.id
      if (teamId !== 'all' && player.teamId !== teamId) return false
      if (playerId !== 'all' && player.id !== playerId) return false
      return true
    })
  }, [data.ownPlayer?.id, data.players, isPlayer, playerId, teamId])

  const rows = scopedPlayers.map((player) => ({
    id: player.id,
    name: player.name,
    teamName: player.teamName || data.teams.find((team) => team.id === player.teamId)?.name || '—',
    status: player.status || 'Active',
    availability: player.availability || 'Pending',
    ...playerPerformance(player, data.matches),
  }))

  const chartPlayers = playerId === 'all' ? scopedPlayers : scopedPlayers.filter((item) => item.id === playerId)
  const breakdown = availabilityBreakdown(
    data.matches,
    chartPlayers.map((player) => player.id),
  )

  function handleExport() {
    downloadCsv('myinnings-player-report.csv', rows, [
      { label: 'Player', value: (row) => row.name },
      { label: 'Team', value: (row) => row.teamName },
      { label: 'Available', value: (row) => row.available },
      { label: 'Selected', value: (row) => row.selected },
      { label: 'Played', value: (row) => row.played },
      { label: 'Availability Rate', value: (row) => `${row.availabilityRate}%` },
      { label: 'Selection Rate', value: (row) => `${row.selectionRate}%` },
    ])
  }

  const mine = data.playerStats

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>

      {isPlayer ? (
        <>
          <ReportSection title="My Performance">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <ReportStatCard label="Matches Available" value={mine?.available || 0} icon="check" />
              <ReportStatCard label="Matches Selected" value={mine?.selected || 0} icon="players" />
              <ReportStatCard label="Matches Played" value={mine?.played || 0} icon="matches" />
              <ReportStatCard label="Availability Rate" value={`${mine?.availabilityRate || 0}%`} icon="clipboard" />
              <ReportStatCard label="Squad Selection Rate" value={`${mine?.selectionRate || 0}%`} icon="trophy" />
            </div>
          </ReportSection>
        </>
      ) : (
        <>
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
              {
                id: 'player',
                label: 'Player',
                value: playerId,
                onChange: setPlayerId,
                options: [
                  { value: 'all', label: 'All players' },
                  ...data.players
                    .filter((player) => teamId === 'all' || player.teamId === teamId)
                    .map((player) => ({ value: player.id, label: player.name })),
                ],
              },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReportStatCard label="Total Players" value={scopedPlayers.length} icon="players" />
            <ReportStatCard
              label="Active Players"
              value={scopedPlayers.filter((player) => player.status !== 'Inactive' && player.status !== 'Suspended').length}
              icon="check"
            />
            <ReportStatCard label="Squad selections" value={rows.reduce((sum, row) => sum + row.selected, 0)} icon="clipboard" />
            <ReportStatCard label="Match participation" value={rows.reduce((sum, row) => sum + row.played, 0)} icon="matches" />
          </div>
        </>
      )}

      <ReportSection title="Player availability">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AvailabilityChart
            data={[
              { name: 'Available', value: breakdown.Available },
              { name: 'Unavailable', value: breakdown['Not Available'] },
              { name: 'Pending', value: breakdown.Pending },
            ]}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Mini label="Available" value={`${breakdown.availableRate}%`} />
            <Mini label="Unavailable" value={`${breakdown.unavailableRate}%`} />
            <Mini label="Pending" value={`${breakdown.pendingRate}%`} />
          </div>
        </div>
      </ReportSection>

      {!isPlayer ? (
        <ReportSection title="Player statistics">
          <ReportTable
            rows={rows}
            emptyTitle="No player data"
            emptyDescription="No player activity was found for the selected period."
            columns={[
              { id: 'name', label: 'Player' },
              { id: 'teamName', label: 'Team' },
              { id: 'available', label: 'Available' },
              { id: 'selected', label: 'Selected' },
              { id: 'played', label: 'Played' },
              { id: 'availabilityRate', label: 'Availability', render: (row) => `${row.availabilityRate}%` },
              { id: 'selectionRate', label: 'Squad rate', render: (row) => `${row.selectionRate}%` },
            ]}
          />
        </ReportSection>
      ) : null}
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
