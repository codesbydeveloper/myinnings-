import { Link } from 'react-router-dom'
import ActivityItem from './ActivityItem'
import EmptyDashboardState from './EmptyDashboardState'
import SectionCard from './SectionCard'

export default function RecentActivity({ activities = [], viewAllTo = '/activity' }) {
  return (
    <SectionCard
      title="Recent Activity"
      action={
        <Link to={viewAllTo} className="text-sm font-medium text-emerald-700">
          View all
        </Link>
      }
    >
      {activities.length === 0 ? (
        <EmptyDashboardState
          icon="clipboard"
          title="No recent activity"
          description="Updates from your teams and matches will appear here."
        />
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
