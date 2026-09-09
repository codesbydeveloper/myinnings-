import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { formatINR } from '../../utils/helpers'
import ChartFrame from './ChartFrame'

export default function FinanceTrendChart({ data = [] }) {
  return (
    <ChartFrame
      data={data}
      emptyTitle="NO FINANCE DATA"
      emptyDescription="No financial activity was found."
    >
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} width={56} tickFormatter={(value) => `₹${value}`} />
        <Tooltip formatter={(value) => formatINR(value)} />
        <Area type="monotone" dataKey="amount" stroke="#059669" fill="#05966922" strokeWidth={2} />
      </AreaChart>
    </ChartFrame>
  )
}
