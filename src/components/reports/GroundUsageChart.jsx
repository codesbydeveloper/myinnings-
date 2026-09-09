import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import ChartFrame from './ChartFrame'

export default function GroundUsageChart({ data = [] }) {
  const rows = data.slice(0, 6)
  return (
    <ChartFrame
      data={rows}
      emptyTitle="NO GROUND BOOKINGS"
      emptyDescription="No bookings were found for the selected period."
    >
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="groundName" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-18} textAnchor="end" height={48} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} width={32} />
        <Tooltip />
        <Bar dataKey="bookings" fill="#059669" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartFrame>
  )
}
