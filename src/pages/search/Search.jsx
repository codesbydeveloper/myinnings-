import { Link, useSearchParams } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import { useGrounds } from '../../context/GroundContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useTournaments } from '../../context/TournamentContext'
import { getVisibleMatches } from '../../utils/matchAccess'
import { getVisiblePlayers } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'
import { useAuth } from '../../context/AuthContext'

function matchesQuery(fields, query) {
  return fields.filter(Boolean).some((field) => String(field).toLowerCase().includes(query))
}

export default function Search() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { grounds } = useGrounds()
  const [params] = useSearchParams()
  const query = params.get('q')?.trim().toLowerCase() || ''

  const visibleTeams = getVisibleTeams(teams, players, user)
  const visiblePlayers = getVisiblePlayers(players, teams, user)
  const visibleMatches = getVisibleMatches(matches, user, teams, players)

  const teamHits = query
    ? visibleTeams.filter((item) => matchesQuery([item.name, item.city, item.location], query)).slice(0, 6)
    : []
  const playerHits = query
    ? visiblePlayers.filter((item) => matchesQuery([item.name, item.teamName, item.position], query)).slice(0, 6)
    : []
  const matchHits = query
    ? visibleMatches
        .filter((item) => matchesQuery([item.title, item.home, item.away, item.venue], query))
        .slice(0, 6)
    : []
  const tournamentHits = query
    ? tournaments.filter((item) => matchesQuery([item.name, item.city, item.location], query)).slice(0, 6)
    : []
  const groundHits = query
    ? grounds.filter((item) => matchesQuery([item.name, item.city, item.location], query)).slice(0, 6)
    : []

  const total = teamHits.length + playerHits.length + matchHits.length + tournamentHits.length + groundHits.length

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Search</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          {query ? `Results for “${params.get('q')}”.` : 'Search teams, players, matches, tournaments, and grounds.'}
        </p>
      </section>

      {!query ? (
        <EmptyDashboardState
          icon="search"
          title="Start a search"
          description="Use the header search to find teams, players, matches, and venues."
        />
      ) : !total ? (
        <EmptyDashboardState
          icon="search"
          title="No results found"
          description="Try a team name, player name, match, or ground."
        />
      ) : (
        <div className="space-y-5">
          <Group title="Teams" items={teamHits} to={(item) => `/teams/${item.id}`} label={(item) => item.name} />
          <Group title="Players" items={playerHits} to={(item) => `/players/${item.id}`} label={(item) => item.name} hint={(item) => item.teamName} />
          <Group
            title="Matches"
            items={matchHits}
            to={(item) => `/matches/${item.id}`}
            label={(item) => item.title || `${item.home} vs ${item.away}`}
          />
          <Group title="Tournaments" items={tournamentHits} to={(item) => `/tournaments/${item.id}`} label={(item) => item.name} />
          <Group title="Grounds" items={groundHits} to={(item) => `/grounds/${item.id}`} label={(item) => item.name} />
        </div>
      )}
    </div>
  )
}

function Group({ title, items, to, label, hint }) {
  if (!items.length) return null
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id}>
            <Link to={to(item)} className="flex min-h-11 items-center justify-between gap-3 py-2.5 text-sm font-medium text-slate-800 hover:text-emerald-700">
              <span className="min-w-0 truncate">{label(item)}</span>
              {hint?.(item) ? <span className="shrink-0 text-xs text-slate-400">{hint(item)}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
