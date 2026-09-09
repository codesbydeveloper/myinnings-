import { useEffect, useState } from 'react'
import AdminView from '../../components/dashboard/AdminView'
import CalendarWidget from '../../components/dashboard/CalendarWidget'
import CaptainView from '../../components/dashboard/CaptainView'
import DashboardSkeleton from '../../components/dashboard/DashboardSkeleton'
import FinancialOverview from '../../components/dashboard/FinancialOverview'
import ManagerView from '../../components/dashboard/ManagerView'
import NotificationsWidget from '../../components/dashboard/NotificationsWidget'
import OrganizerView from '../../components/dashboard/OrganizerView'
import PlayerView from '../../components/dashboard/PlayerView'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivity from '../../components/dashboard/RecentActivity'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import StatsCard from '../../components/dashboard/StatsCard'
import TeamPerformance from '../../components/dashboard/TeamPerformance'
import UpcomingMatches from '../../components/dashboard/UpcomingMatches'
import UpcomingVenueBookings from '../../components/dashboard/UpcomingVenueBookings'
import Icon from '../../components/common/Icons'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useMatches } from '../../context/MatchContext'
import { useNotifications } from '../../context/NotificationContext'
import { useActivity } from '../../context/ActivityContext'
import { useTournaments } from '../../context/TournamentContext'
import { useFinance } from '../../context/FinanceContext'
import { useGrounds } from '../../context/GroundContext'
import { useTeams } from '../../context/TeamContext'
import { getDashboardData, getRoleCopy } from '../../data/dashboardData'
import { ROLES } from '../../utils/constants'
import { formatLongDate, formatINR, getFirstName, simulateRequest } from '../../utils/helpers'
import { canCreateMatch, getVisibleMatches } from '../../utils/matchAccess'
import { findOwnPlayer, getVisiblePlayers } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'
import { loadUsers } from '../../utils/storage'
import { teamMatchRecord } from '../../utils/reportUtils'
import { dashboardTransaction } from '../../data/financeModel'
import { approvedRegistrations, pendingRegistrations } from '../../data/tournamentModel'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function RoleExtras({ role, data }) {
  if (role === ROLES.MANAGER) return <ManagerView data={data} />
  if (role === ROLES.ORGANIZER) return <OrganizerView />
  if (role === ROLES.PLAYER) return <PlayerView />
  if (role === ROLES.ADMIN) return <AdminView data={data} />
  return <CaptainView data={data} />
}

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { notifications } = useNotifications()
  const { activities } = useActivity()
  const { teams, players } = useTeams()
  const { payments, ledger, summary, effectiveStatus } = useFinance()
  const { bookings } = useGrounds()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tick, setTick] = useState(0)
  const role = user?.role
  const data = getDashboardData(user)
  const ownPlayer = findOwnPlayer(players, user)
  const visibleMatches = getVisibleMatches(matches, user, teams, players)
  const upcomingLive = visibleMatches.filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live',
  )
  const visibleTeams = getVisibleTeams(teams, players, user)
  const visiblePlayers = getVisiblePlayers(players, teams, user)
  const livePerformance = visibleTeams
    .map((team) => {
      const record = teamMatchRecord(team, visibleMatches)
      return {
        name: record.teamName,
        played: record.played,
        wins: record.wins,
        losses: record.losses,
        draws: record.draws,
        winRate: record.winPercentage,
      }
    })
    .filter((team) => team.played > 0)
    .slice(0, 4)

  useEffect(() => {
    let active = true
    simulateRequest(420).then(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [user?.id])

  const stats = data.stats.map((stat) => {
    if (role === ROLES.ORGANIZER && stat.id === 'approvals') {
      const pending = tournaments.flatMap((item) => pendingRegistrations(item)).length
      return { ...stat, value: String(pending) }
    }
    if (role === ROLES.ORGANIZER && stat.id === 'tournaments') {
      const active = tournaments.filter((item) => !['Completed', 'Cancelled', 'Draft'].includes(item.status)).length
      return { ...stat, value: String(active) }
    }
    if (role === ROLES.ORGANIZER && stat.id === 'teams') {
      const count = tournaments.reduce((sum, item) => sum + approvedRegistrations(item).length, 0)
      return { ...stat, value: String(count) }
    }
    if (role === ROLES.PLAYER && stat.id === 'availability') {
      const pending = upcomingLive.filter((match) => {
        const status =
          (ownPlayer && match.availability?.[ownPlayer.id]) || ownPlayer?.availability || 'Pending'
        return status === 'Pending'
      }).length
      return { ...stat, value: String(pending) }
    }
    if (role === ROLES.PLAYER && stat.id === 'payment') {
      const pending = payments
        .filter((item) => ['Pending', 'Overdue', 'Pending Review'].includes(effectiveStatus(item)))
        .reduce((total, item) => total + Number(item.amount || 0), 0)
      return { ...stat, value: formatINR(pending) }
    }
    if ((stat.id === 'payments' || stat.id === 'revenue') && role !== ROLES.ORGANIZER) {
      if (stat.id === 'revenue') {
        return { ...stat, value: formatINR(summary.collected) }
      }
      return { ...stat, value: formatINR(summary.pending) }
    }
    if (stat.id === 'matches' || stat.id === 'upcoming') {
      return {
        ...stat,
        value: String(upcomingLive.length),
        hint: tick ? 'Updated just now' : stat.hint,
      }
    }
    if (stat.id === 'teams' && role !== ROLES.ORGANIZER) {
      const count = visibleTeams.filter((team) => team.status === 'Active').length || visibleTeams.length
      return { ...stat, value: String(count), hint: tick ? 'Updated just now' : stat.hint }
    }
    if (stat.id === 'players') {
      return { ...stat, value: String(visiblePlayers.length), hint: tick ? 'Updated just now' : stat.hint }
    }
    if (stat.id === 'users') {
      return { ...stat, value: String(loadUsers().length), hint: 'Demo and registered accounts' }
    }
    if (stat.id === 'tournaments' && role === ROLES.ADMIN) {
      const active = tournaments.filter((item) => !['Completed', 'Cancelled', 'Draft'].includes(item.status)).length
      return { ...stat, value: String(active), hint: tick ? 'Updated just now' : stat.hint }
    }
    if (stat.id === 'played') {
      const completed = visibleMatches.filter((match) => match.status === 'Completed').length
      return { ...stat, value: String(completed), hint: tick ? 'Updated just now' : stat.hint }
    }
    return stat
  })

  async function handleRefresh() {
    setRefreshing(true)
    await simulateRequest(500)
    setTick((value) => value + 1)
    setRefreshing(false)
    showToast('Dashboard updated successfully.')
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-emerald-700 uppercase">
              {formatLongDate()}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {getGreeting()}, {getFirstName(user?.name)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              {getRoleCopy(role)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Icon name="refresh" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <UpcomingMatches matches={upcomingLive.slice(0, 4)} canCreate={canCreateMatch(role)} />
          <UpcomingVenueBookings bookings={bookings} user={user} visibleMatches={visibleMatches} />
          <TeamPerformance
            teams={livePerformance.length ? livePerformance : data.performance}
            viewTo={role === ROLES.PLAYER ? '/reports' : '/reports/teams'}
          />
          <RecentTransactions
            transactions={[...ledger].reverse().slice(0, 4).map(dashboardTransaction)}
          />
          <RoleExtras role={role} data={data} />
        </div>
        <div className="space-y-4">
          <CalendarWidget matches={visibleMatches} />
          <NotificationsWidget notifications={notifications.slice(0, 5)} />
          <RecentActivity activities={activities.slice(0, 5)} />
        </div>
      </div>

      <FinancialOverview
        finance={{
          viewTo: role === ROLES.PLAYER ? '/finance' : '/finance',
          items:
            role === ROLES.PLAYER
              ? [
                  { label: 'Pending Payment', value: formatINR(summary.pending) },
                  { label: 'Total Paid', value: formatINR(summary.collected) },
                  {
                    label: 'Payment Status',
                    value: summary.pending > 0 ? 'Due' : 'Paid',
                  },
                ]
              : role === ROLES.ORGANIZER
                ? [
                    { label: 'Tournament Income', value: formatINR(summary.collected) },
                    { label: 'Pending Fees', value: formatINR(summary.pending) },
                    { label: 'Tournament Expenses', value: formatINR(summary.expenses) },
                    { label: 'Net Balance', value: formatINR(summary.net) },
                  ]
                : [
                    { label: 'Total Collected', value: formatINR(summary.collected) },
                    { label: 'Total Pending', value: formatINR(summary.pending) },
                    { label: 'Total Expenses', value: formatINR(summary.expenses) },
                    { label: 'Net Balance', value: formatINR(summary.net) },
                  ],
        }}
      />
      <QuickActions
        actions={[
          ...(data.quickActions || []),
          { label: 'View Full Reports', to: '/reports', icon: 'reports' },
        ]}
      />
    </div>
  )
}
