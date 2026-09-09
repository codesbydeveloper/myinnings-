import { ResponsiveContainer } from 'recharts'
import ReportEmptyState from './ReportEmptyState'

export default function ChartFrame({
  data = [],
  height = 280,
  emptyTitle,
  emptyDescription,
  children,
}) {
  if (!data.length) {
    return <ReportEmptyState title={emptyTitle} description={emptyDescription} icon="reports" />
  }

  return (
    <div className="h-72 w-full min-w-0" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
