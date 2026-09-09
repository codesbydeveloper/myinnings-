import { getActivities } from './activities'
import { MATCHES } from './matches'
import { getNotificationItems } from './notifications'
import { PAYMENTS } from './payments'
import { PLAYERS } from './players'
import { TOURNAMENTS } from './tournaments'
import { getTransactions } from './transactions'
import { AVAILABILITY_REQUESTS, PLATFORM_USERS } from './users'
import { ROLES, TOURNAMENT_WIP } from '../utils/constants'
import { daysUntil } from '../utils/helpers'

export { getNotificationCount } from './notifications'
export { getActivities } from './activities'
export { getTransactions } from './transactions'

export const ROLE_COPY = {
  [ROLES.CAPTAIN]: 'Review your teams, match availability, squads, and tournament registrations.',
  [ROLES.MANAGER]: 'Manage teams and players, create matches, track payments, and book grounds.',
  [ROLES.ORGANIZER]: 'Create tournaments, approve teams, generate fixtures, and publish results.',
  [ROLES.PLAYER]: 'Check upcoming matches, update availability, and review your payments.',
  [ROLES.ADMIN]: 'Oversee teams, grounds, finance, reports, and all platform activity.',
}

export function getRoleCopy(role) {
  if (TOURNAMENT_WIP) {
    if (role === ROLES.CAPTAIN) return 'Review your teams, match availability, and squads.'
    if (role === ROLES.ORGANIZER) return 'Review venues, bookings, and related club activity.'
  }
  return ROLE_COPY[role] ?? 'Welcome back to MyInnings.'
}

export function getNotifications(role) {
  return getNotificationItems(role)
}

function upcomingMatches() {
  return MATCHES.filter((match) => match.status === 'Upcoming')
}

function nextMatchHint(matches) {
  const next = matches[0]
  if (!next) return 'No matches scheduled'
  const days = daysUntil(next.dateKey)
  if (days === 0) return 'Next match is today'
  if (days === 1) return 'Next match in 1 day'
  if (days > 1) return `Next match in ${days} days`
  return 'See completed fixtures'
}

function playerMatches(user) {
  const teamHint = user?.name === 'Arjun Singh' ? 'Mumbai Warriors' : 'Mumbai Warriors'
  return upcomingMatches().filter(
    (match) => match.home === teamHint || match.away === teamHint,
  )
}

export function getDashboardData(user) {
  const role = user?.role
  const upcoming = upcomingMatches()
  const activities = getActivities(role)
  const notifications = getNotificationItems(role).slice(0, 4)
  const transactions = getTransactions(role)

  if (role === ROLES.MANAGER) {
    return {
      stats: [
        { id: 'teams', label: 'Active Teams', value: '2', icon: 'teams', hint: '+1 this month' },
        { id: 'players', label: 'Total Players', value: '28', icon: 'players', hint: '4 new this month' },
        { id: 'matches', label: 'Upcoming Matches', value: '4', icon: 'matches', hint: nextMatchHint(upcoming) },
        { id: 'tasks', label: 'Pending Tasks', value: '6', icon: 'clipboard', hint: '2 due today' },
      ],
      upcomingMatches: upcoming,
      activities,
      notifications,
      transactions,
      finance: {
        viewTo: '/finance',
        items: [
          { label: 'Team Budget', value: '₹85,000' },
          { label: 'Pending Collection', value: '₹12,500' },
          { label: 'Recent Expenses', value: '₹8,750' },
        ],
      },
      performance: [
        { name: 'Mumbai Warriors', played: 18, wins: 12, losses: 5, draws: 1, winRate: 67 },
        { name: 'Delhi Strikers', played: 14, wins: 8, losses: 5, draws: 1, winRate: 57 },
      ],
      tasks: [
        'Confirm ground booking',
        'Select final squad',
        'Follow up with 3 players',
        'Collect pending match payment',
        'Share travel notes with the team',
        'Update player contact list',
      ],
      quickActions: [
        { label: 'Add Player', to: '/players/new', icon: 'players' },
        { label: 'Create Match', to: '/matches/new', icon: 'matches' },
        { label: 'Manage Team', to: '/teams', icon: 'teams' },
        { label: 'View Grounds', to: '/grounds', icon: 'grounds' },
        { label: 'View Payments', to: '/finance', icon: 'finance' },
      ],
    }
  }

  if (role === ROLES.ORGANIZER) {
    return {
      stats: [
        { id: 'tournaments', label: 'Active Tournaments', value: '2', icon: 'tournaments', hint: 'Both in group stage' },
        { id: 'teams', label: 'Registered Teams', value: '16', icon: 'teams', hint: '+3 this week' },
        { id: 'matches', label: 'Upcoming Matches', value: '8', icon: 'matches', hint: nextMatchHint(upcoming) },
        { id: 'approvals', label: 'Pending Approvals', value: '3', icon: 'clipboard', hint: 'Action required' },
      ],
      upcomingMatches: upcoming,
      activities,
      notifications,
      transactions,
      finance: {
        viewTo: '/finance',
        items: [
          { label: 'Tournament Revenue', value: '₹1,20,000' },
          { label: 'Registration Fees', value: '₹86,000' },
          { label: 'Expenses', value: '₹34,000' },
        ],
      },
      tournaments: TOURNAMENTS.filter((item) => item.status === 'Active'),
      quickActions: [
        { label: 'Create Tournament', to: '/tournaments/new', icon: 'tournaments' },
        { label: 'Approve Teams', to: '/tournaments', icon: 'teams' },
        { label: 'View Grounds', to: '/grounds', icon: 'grounds' },
        { label: 'Update Results', to: '/matches', icon: 'check' },
      ],
    }
  }

  if (role === ROLES.PLAYER) {
    const mine = playerMatches(user)
    return {
      stats: [
        { id: 'played', label: 'My Matches', value: '12', icon: 'matches', hint: '8 wins this season' },
        { id: 'upcoming', label: 'Upcoming Matches', value: '2', icon: 'clock', hint: nextMatchHint(mine) },
        { id: 'availability', label: 'Availability Requests', value: '3', icon: 'clipboard', hint: 'Respond before Friday' },
        { id: 'payment', label: 'Pending Payment', value: '₹750', icon: 'finance', hint: '2 items outstanding' },
      ],
      upcomingMatches: mine,
      activities,
      notifications,
      transactions,
      nextMatch: mine[0] ?? upcoming[0],
      availability: AVAILABILITY_REQUESTS,
      finance: {
        viewTo: '/payments',
        items: [
          { label: 'Pending Payment', value: '₹750' },
          { label: 'Recent Payments', value: '₹500' },
          { label: 'Payment Status', value: 'Due' },
        ],
      },
      payments: (() => {
        const own = PAYMENTS.filter((item) => item.player === user?.name)
        if (own.length) return own
        return PAYMENTS.filter((item) => item.player === 'Arjun Singh').map(
          (item) => ({ ...item, player: user?.name ?? item.player }),
        )
      })(),
      quickActions: [
        { label: 'Update Availability', to: '/availability', icon: 'clipboard' },
        { label: 'View My Matches', to: '/matches', icon: 'matches' },
        { label: 'View Grounds', to: '/grounds', icon: 'grounds' },
        { label: 'View Payments', to: '/finance', icon: 'finance' },
      ],
    }
  }

  if (role === ROLES.ADMIN) {
    return {
      stats: [
        { id: 'users', label: 'Total Users', value: '248', icon: 'user', hint: '+12 this week' },
        { id: 'teams', label: 'Active Teams', value: '36', icon: 'teams', hint: '+3 this month' },
        { id: 'tournaments', label: 'Active Tournaments', value: '8', icon: 'tournaments', hint: '2 launching soon' },
        { id: 'revenue', label: 'Platform Revenue', value: '₹2,45,000', icon: 'finance', hint: '+8% vs last month' },
      ],
      upcomingMatches: upcoming,
      activities,
      notifications,
      transactions,
      recentUsers: PLATFORM_USERS,
      recentTournaments: TOURNAMENTS,
      finance: {
        viewTo: '/finance',
        items: [
          { label: 'Platform Revenue', value: '₹2,45,000' },
          { label: 'Total Collections', value: '₹1,86,000' },
          { label: 'Monthly Expenses', value: '₹26,500' },
        ],
      },
      quickActions: [
        { label: 'Manage Users', to: '/users', icon: 'user' },
        { label: 'Manage Teams', to: '/teams', icon: 'teams' },
        { label: 'View Grounds', to: '/grounds', icon: 'grounds' },
        { label: 'Manage Tournaments', to: '/tournaments', icon: 'tournaments' },
      ],
    }
  }

  return {
    stats: [
      { id: 'teams', label: 'My Teams', value: '3', icon: 'teams', hint: '+1 this month' },
      { id: 'players', label: 'Total Players', value: '42', icon: 'players', hint: '6 new this month' },
      { id: 'matches', label: 'Upcoming Matches', value: '3', icon: 'matches', hint: nextMatchHint(upcoming) },
      { id: 'payments', label: 'Pending Payments', value: '₹4,500', icon: 'finance', hint: '3 players pending' },
    ],
    upcomingMatches: upcoming.slice(0, 3),
    activities,
    notifications,
    transactions,
    availability: [
      { name: 'Mumbai Warriors', available: 12, total: 15 },
      { name: 'Pune Panthers', available: 11, total: 13 },
      { name: 'Delhi Strikers', available: 10, total: 14 },
    ],
    pendingPayments: PLAYERS.filter((player) => player.dues > 0).slice(0, 3),
    finance: {
      viewTo: '/finance',
      items: [
        { label: 'Total Collected', value: '₹45,000' },
        { label: 'Pending Payments', value: '₹12,500' },
        { label: 'Recent Expenses', value: '₹8,750' },
        { label: 'Current Balance', value: '₹23,750' },
      ],
    },
    performance: [
      { name: 'Mumbai Warriors', played: 18, wins: 12, losses: 5, draws: 1, winRate: 67 },
      { name: 'Pune Panthers', played: 12, wins: 7, losses: 4, draws: 1, winRate: 58 },
    ],
    quickActions: [
      { label: 'Create Match', to: '/matches/new', icon: 'matches' },
      { label: 'Manage Team', to: '/teams', icon: 'teams' },
      { label: 'View Grounds', to: '/grounds', icon: 'grounds' },
      { label: 'Record Payment', to: '/finance', icon: 'finance' },
    ],
  }
}
