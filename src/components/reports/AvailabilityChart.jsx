import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import ChartFrame from './ChartFrame'

const COLORS = {
  Available: '#059669',
  Unavailable: '#dc2626',
  Pending: '#d97706',
}

export default function AvailabilityChart({ data = [] }) {
  return (
    <ChartFrame
      data={data.filter((item) => item.value > 0)}
      emptyTitle="NO AVAILABILITY DATA"
      emptyDescription="No availability responses were found for the selected period."
    >
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
          {data.map((item) => (
            <Cell key={item.name} fill={COLORS[item.name] || '#64748b'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartFrame>
  )
}
