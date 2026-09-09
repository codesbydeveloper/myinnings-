import EmptyDashboardState from '../dashboard/EmptyDashboardState'

export default function AccessRestricted({
  title = "You don't have permission to perform this action.",
  description = 'This page is limited to authorized MyInnings roles.',
  to = '/dashboard',
  actionLabel = 'Go to Dashboard',
}) {
  return (
    <EmptyDashboardState
      icon="lock"
      title={title}
      description={description}
      actionLabel={actionLabel}
      to={to}
    />
  )
}
