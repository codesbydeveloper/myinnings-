import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import ChartFrame from './ChartFrame'

export default function MatchTrendChart({ data = [] }) {
  return (
    <ChartFrame
      data={data}
      emptyTitle="NO MATCH DATA"
      emptyDescription="No matches are available for the selected period."
    >
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} width={32} />
        <Tooltip />
        <Area type="monotone" dataKey="matches" stroke="#059669" fill="#05966922" strokeWidth={2} />
      </AreaChart>
    </ChartFrame>
  )
}
