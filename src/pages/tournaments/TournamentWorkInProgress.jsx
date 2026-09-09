import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'

export default function TournamentWorkInProgress() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Tournaments
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          This section is currently unavailable.
        </p>
      </section>
      <EmptyDashboardState
        icon="tournaments"
        title="Work in Progress"
        description="The tournament module is currently under development. Please check back soon."
        actionLabel="Go to Dashboard"
        to="/dashboard"
      />
    </div>
  )
}
