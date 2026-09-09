import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import ChartFrame from './ChartFrame'

export default function TeamCompareChart({ data = [] }) {
  return (
    <ChartFrame
      data={data}
      emptyTitle="NO MATCH DATA"
      emptyDescription="No matches are available for the selected period."
    >
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="teamName" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-16} textAnchor="end" height={48} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} width={32} />
        <Tooltip />
        <Legend />
        <Bar dataKey="wins" fill="#059669" radius={[4, 4, 0, 0]} />
        <Bar dataKey="losses" fill="#dc2626" radius={[4, 4, 0, 0]} />
        <Bar dataKey="draws" fill="#d97706" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartFrame>
  )
}
