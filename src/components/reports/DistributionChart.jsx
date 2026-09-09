import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { CHART_COLORS } from '../../utils/reportUtils'
import ChartFrame from './ChartFrame'

export default function DistributionChart({
  data = [],
  emptyTitle = 'No data',
  emptyDescription = 'Nothing is available for the selected period.',
}) {
  const rows = data.filter((item) => item.value > 0)
  return (
    <ChartFrame data={rows} emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={3}>
          {rows.map((item, index) => (
            <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ChartFrame>
  )
}
