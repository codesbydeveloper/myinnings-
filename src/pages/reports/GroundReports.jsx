import { useMemo, useState } from 'react'
import GroundUsageChart from '../../components/reports/GroundUsageChart'
import DistributionChart from '../../components/reports/DistributionChart'
import ReportActions from '../../components/reports/ReportActions'
import ReportFilters from '../../components/reports/ReportFilters'
import ReportSection from '../../components/reports/ReportSection'
import ReportStatCard from '../../components/reports/ReportStatCard'
import ReportTable from '../../components/reports/ReportTable'
import { useReportData } from '../../hooks/useReportData'
import { bookingStatusCounts, downloadCsv, groundUsage } from '../../utils/reportUtils'
import { TOURNAMENT_WIP } from '../../utils/constants'

export default function GroundReports() {
  const data = useReportData()
  const [groundId, setGroundId] = useState('all')
  const [type, setType] = useState('all')

  const bookings = useMemo(() => {
    return data.bookings.filter((item) => {
      if (groundId !== 'all' && item.groundId !== groundId && item.groundName !== groundId) return false
      if (type !== 'all' && item.type !== type) return false
      return true
    })
  }, [data.bookings, groundId, type])

  const usage = groundUsage(data.grounds, bookings)
  const counts = bookingStatusCounts(bookings)
  const availableGrounds = data.grounds.filter((item) => item.status === 'Available').length

  function handleExport() {
    downloadCsv('myinnings-ground-report.csv', usage, [
      { label: 'Ground', value: (row) => row.groundName },
      { label: 'Bookings', value: (row) => row.bookings },
      { label: 'Match', value: (row) => row.match },
      ...(TOURNAMENT_WIP ? [] : [{ label: 'Tournament', value: (row) => row.tournament }]),
      { label: 'Practice', value: (row) => row.practice },
    ])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ReportActions onPrint={() => window.print()} onExport={handleExport} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard label="Total Grounds" value={data.grounds.length} icon="grounds" />
        <ReportStatCard label="Total Bookings" value={counts.total} icon="clock" />
        <ReportStatCard label="Available Grounds" value={availableGrounds} icon="check" />
        <ReportStatCard
          label="Most Used Ground"
          value={usage.find((item) => item.bookings > 0)?.groundName || '—'}
          icon="trophy"
        />
      </div>
      <ReportFilters
        filters={[
          {
            id: 'ground',
            label: 'Ground',
            value: groundId,
            onChange: setGroundId,
            options: [
              { value: 'all', label: 'All grounds' },
              ...data.grounds.map((item) => ({ value: item.id, label: item.name })),
            ],
          },
          {
            id: 'type',
            label: 'Booking type',
            value: type,
            onChange: setType,
            options: [
              { value: 'all', label: 'All types' },
              { value: 'Match', label: 'Match' },
              { value: 'Tournament', label: 'Tournament' },
              { value: 'Practice', label: 'Practice' },
              { value: 'Other', label: 'Other' },
            ].filter((item) => !(TOURNAMENT_WIP && item.value === 'Tournament')),
          },
        ]}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportSection title="Most used grounds">
          <GroundUsageChart data={usage.filter((item) => item.bookings > 0)} />
        </ReportSection>
        <ReportSection title="Booking status">
          <DistributionChart
            data={[
              { name: 'Upcoming', value: counts.upcoming },
              { name: 'Completed', value: counts.completed },
              { name: 'Cancelled', value: counts.cancelled },
            ]}
            emptyTitle="NO GROUND BOOKINGS"
            emptyDescription="No bookings were found for the selected period."
          />
        </ReportSection>
      </div>
      <ReportSection title="Ground usage">
        <ReportTable
          rows={usage.map((row) => ({ ...row, id: row.groundId }))}
          emptyTitle="NO GROUND BOOKINGS"
          emptyDescription="No bookings were found for the selected period."
          columns={[
            { id: 'groundName', label: 'Ground name' },
            { id: 'bookings', label: 'Number of bookings' },
            { id: 'match', label: 'Match bookings' },
            ...(TOURNAMENT_WIP ? [] : [{ id: 'tournament', label: 'Tournament bookings' }]),
            { id: 'practice', label: 'Practice bookings' },
          ]}
        />
      </ReportSection>
    </div>
  )
}
