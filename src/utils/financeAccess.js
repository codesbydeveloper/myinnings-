import { ROLES } from './constants'
import { getVisibleMatches } from './matchAccess'
import { getVisibleTeams, isAdmin, isOrganizer, isPlayer } from './teamAccess'

export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Overdue', 'Cancelled', 'Pending Review']

export const PAYMENT_TYPES = ['Match Contribution', 'Tournament Registration', 'Other']

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Other']

export const EXPENSE_CATEGORIES = [
  'Ground',
  'Umpire',
  'Equipment',
  'Refreshments',
  'Transportation',
  'Other',
]

export const LEDGER_TYPES = [
  'Payment Received',
  'Match Expense',
  'Tournament Expense',
  'Other Income',
  'Other Expense',
]

export const REPLACEMENT_DECISIONS = [
  { id: 'original', label: 'Original Player Pays' },
  { id: 'replacement', label: 'Replacement Player Pays' },
  { id: 'review', label: 'Both Require Review' },
  { id: 'none', label: 'No Payment Required' },
]

export function visibleTeamIdSet(teams, players, user) {
  return new Set(getVisibleTeams(teams, players, user).map((team) => team.id))
}

export function canViewFinance(user) {
  return Boolean(user)
}

export function canViewFullLedger(user) {
  if (!user) return false
  return user.role !== ROLES.PLAYER
}

export function canViewExpenses(user) {
  if (!user) return false
  return user.role !== ROLES.PLAYER
}

export function canCreatePayment(user) {
  return [ROLES.CAPTAIN, ROLES.MANAGER, ROLES.ORGANIZER, ROLES.ADMIN].includes(user?.role)
}

export function canRecordPayment(user) {
  return canCreatePayment(user)
}

export function canManageExpenses(user) {
  return [ROLES.MANAGER, ROLES.ORGANIZER, ROLES.ADMIN].includes(user?.role)
}

export function canDeleteExpense(user) {
  return canManageExpenses(user)
}

export function canCreateMatchContributions(user) {
  return [ROLES.CAPTAIN, ROLES.MANAGER, ROLES.ADMIN].includes(user?.role)
}

export function canViewTeamFinance(team, user) {
  if (!team || !user) return false
  if (isAdmin(user.role)) return true
  if (isPlayer(user.role) || isOrganizer(user.role)) return false
  return (
    team.captain === user.name ||
    team.assignedCaptains?.includes(user.name) ||
    team.manager === user.name
  )
}

export function canViewTournamentFinance(user) {
  return isAdmin(user?.role) || isOrganizer(user?.role)
}

function involvesVisibleMatch(payment, matches, user, teams, players) {
  if (!payment.matchId) return false
  const match = matches.find((item) => item.id === payment.matchId)
  if (!match) return false
  return getVisibleMatches([match], user, teams, players).length > 0
}

export function canViewPayment(payment, user, { teams, players, matches, ownPlayer }) {
  if (!payment || !user) return false
  if (isAdmin(user.role)) return true

  if (isPlayer(user.role)) {
    return (
      payment.playerName === user.name ||
      (ownPlayer && payment.playerId === ownPlayer.id)
    )
  }

  if (isOrganizer(user.role)) {
    return Boolean(payment.tournamentId) || payment.type === 'Tournament Registration'
  }

  const teamIds = visibleTeamIdSet(teams, players, user)
  if (payment.teamId && teamIds.has(payment.teamId)) return true
  if (involvesVisibleMatch(payment, matches, user, teams, players)) return true

  const player = players.find((item) => item.id === payment.playerId)
  if (player?.teamId && teamIds.has(player.teamId)) return true
  if (payment.playerName) {
    const named = players.find((item) => item.name === payment.playerName)
    if (named?.teamId && teamIds.has(named.teamId)) return true
  }

  return false
}

export function canViewExpense(expense, user, { teams, players, matches }) {
  if (!expense || !user) return false
  if (isPlayer(user.role)) return false
  if (isAdmin(user.role)) return true

  if (isOrganizer(user.role)) {
    if (expense.tournamentId) return true
    if (expense.matchId) {
      const match = matches.find((item) => item.id === expense.matchId)
      return Boolean(match?.tournamentId || match?.source === 'tournament')
    }
    return false
  }

  const teamIds = visibleTeamIdSet(teams, players, user)
  if (expense.teamId && teamIds.has(expense.teamId)) return true
  if (expense.matchId) {
    const match = matches.find((item) => item.id === expense.matchId)
    if (match && getVisibleMatches([match], user, teams, players).length) return true
  }
  return false
}

export function canMutateExpense(expense, user, { teams, players, matches }) {
  if (!canManageExpenses(user) || !canViewExpense(expense, user, { teams, players, matches })) {
    return false
  }
  if (isOrganizer(user.role) && !isAdmin(user.role)) {
    return Boolean(expense.tournamentId) || expense.source === 'finance'
  }
  return true
}

export function canMutatePayment(payment, user, ctx) {
  if (!canRecordPayment(user) || !canViewPayment(payment, user, ctx)) return false
  if (isOrganizer(user.role) && !isAdmin(user.role)) {
    return Boolean(payment.tournamentId) || payment.type === 'Tournament Registration'
  }
  return true
}

export function financeTabsFor(role) {
  if (role === ROLES.PLAYER) {
    return [
      { id: 'overview', to: '/finance', label: 'My Payments' },
      { id: 'payments', to: '/finance/payments', label: 'Payment History' },
    ]
  }

  const tabs = [
    { id: 'overview', to: '/finance', label: 'Overview' },
    { id: 'payments', to: '/finance/payments', label: 'Payments' },
    { id: 'expenses', to: '/finance/expenses', label: 'Expenses' },
    { id: 'ledger', to: '/finance/ledger', label: 'Ledger' },
  ]

  if (role === ROLES.ORGANIZER) {
    return tabs
  }

  return tabs
}
