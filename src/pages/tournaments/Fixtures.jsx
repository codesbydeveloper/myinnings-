import { Link } from 'react-router-dom'
import ResourcePage from '../../components/common/ResourcePage'
import StatusBadge from '../../components/dashboard/StatusBadge'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import { useMatches } from '../../context/MatchContext'

export default function Fixtures() {
  const { matches } = useMatches()
  const fixtures = matches.filter(
    (match) => match.source === 'tournament' && (match.status === 'Upcoming' || match.status === 'Live'),
  )

  return (
    <ResourcePage pathname="/fixtures">
      {fixtures.length ? (
        <div className="space-y-3">
          {fixtures.map((match) => (
            <Link
              key={match.id}
              to={`/matches/${match.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {match.home} vs {match.away}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {match.date} · {match.time}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{match.venue}</p>
                </div>
                <StatusBadge status={match.status} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyDashboardState
          icon="matches"
          title="No upcoming fixtures"
          description="Tournament fixtures will appear here once they are scheduled."
        />
      )}
    </ResourcePage>
  )
}
