import { Link } from 'react-router-dom'
import MatchCard from '../dashboard/MatchCard'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import ProgressBar from '../dashboard/ProgressBar'
import SectionCard from '../dashboard/SectionCard'
import { useMatches } from '../../context/MatchContext'
import { getUpcomingMatchCount } from '../../data/matches'
import { getWinRate } from '../../utils/helpers'
import TeamAvailability from './TeamAvailability'
import TeamFinanceSummary from '../finance/TeamFinanceSummary'
import { useTournaments } from '../../context/TournamentContext'
import { useFinance } from '../../context/FinanceContext'
import { approvedRegistrations } from '../../data/tournamentModel'
import { canViewTeamFinance } from '../../utils/financeAccess'

export default function TeamOverview({ team, roster, upcomingMatches, user, showAvailability }) {
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { getTeamSummary } = useFinance()
  const stats = team.stats || { played: 0, wins: 0, losses: 0, draws: 0 }
  const winRate = getWinRate(stats)
  const preview = upcomingMatches.slice(0, 3)
  const participating = tournaments.filter((item) =>
    approvedRegistrations(item).some((entry) => entry.teamId === team.id),
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Team Information">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Location" value={team.location || team.city} />
            <Info label="Team Type" value={team.type} />
            <Info label="Created Date" value={team.createdDate} />
            <Info label="Captain" value={team.captain || 'Unassigned'} />
            <Info label="Total Players" value={String(team.players)} />
            <Info label="Upcoming Matches" value={String(getUpcomingMatchCount(team.name, matches))} />
          </dl>
          {team.description ? (
            <p className="mt-5 text-sm leading-6 text-slate-600">{team.description}</p>
          ) : null}
        </SectionCard>

        <SectionCard title="Team Statistics">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={stats.played} label="Played" />
            <Stat value={stats.wins} label="Wins" tone="win" />
            <Stat value={stats.losses} label="Losses" tone="loss" />
            <Stat value={stats.draws} label="Draws" />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Win Rate</span>
              <span className="font-semibold text-emerald-700">{winRate}%</span>
            </div>
            <ProgressBar value={stats.wins} total={stats.played} />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Upcoming Matches"
        action={
          <Link to={`/teams/${team.id}?tab=matches`} className="text-sm font-semibold text-emerald-700">
            View All Matches
          </Link>
        }
      >
        {preview.length ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {preview.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <EmptyDashboardState
            icon="matches"
            title="No upcoming matches"
            description="This team does not have any matches scheduled yet."
          />
        )}
      </SectionCard>

      <SectionCard title="Tournaments">
        {participating.length ? (
          <ul className="space-y-2">
            {participating.map((item) => (
              <li key={item.id}>
                <Link to={`/tournaments/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">This team is not registered in a tournament yet.</p>
        )}
      </SectionCard>

      {canViewTeamFinance(team, user) ? (
        <TeamFinanceSummary team={team} summary={getTeamSummary(team)} />
      ) : null}

      {showAvailability ? (
        <TeamAvailability team={team} roster={roster} user={user} upcomingMatch={upcomingMatches[0]} />
      ) : null}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</dd>
    </div>
  )
}

function Stat({ value, label, tone }) {
  const color =
    tone === 'win' ? 'text-emerald-700' : tone === 'loss' ? 'text-rose-700' : 'text-slate-800'

  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
      <p className={`text-xl font-semibold ${color}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
    </div>
  )
}
