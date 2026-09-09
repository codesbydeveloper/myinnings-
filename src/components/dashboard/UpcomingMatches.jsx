import { Link } from 'react-router-dom'
import EmptyDashboardState from './EmptyDashboardState'
import MatchCard from './MatchCard'
import SectionCard from './SectionCard'

export default function UpcomingMatches({ matches = [], canCreate = false }) {
  return (
    <SectionCard
      title="Upcoming Matches"
      action={
        <Link to="/matches" className="text-sm font-medium text-emerald-700">
          View all
        </Link>
      }
    >
      {matches.length === 0 ? (
        <EmptyDashboardState
          title="No Upcoming Matches"
          description="You don't have any matches scheduled yet."
          actionLabel={canCreate ? 'Create Match' : undefined}
          to={canCreate ? '/matches/new' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </SectionCard>
  )
}
