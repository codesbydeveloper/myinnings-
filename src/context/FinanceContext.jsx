/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SEED_EXPENSES, SEED_PAYMENTS } from '../data/finance'
import {
  buildLedger,
  derivedMatchExpenses,
  displayDate,
  effectivePaymentStatus,
  financialSummary,
  nextCode,
  replacementDecisionKey,
  teamFinancialSummary,
  todayKey,
  tournamentFinancialSummary,
} from '../data/financeModel'
import { estimatedPerPlayer, formatDateKey, formatTimestamp } from '../data/matchModel'
import { AUTH_STORAGE_KEYS, ROLES } from '../utils/constants'
import {
  canCreateMatchContributions,
  canCreatePayment,
  canDeleteExpense,
  canManageExpenses,
  canMutateExpense,
  canMutatePayment,
  canRecordPayment,
  canViewExpense,
  canViewFullLedger,
  canViewPayment,
  canViewTeamFinance,
} from '../utils/financeAccess'
import { createId, formatINR } from '../utils/helpers'
import { getVisibleMatches, canManageCosts } from '../utils/matchAccess'
import { findOwnPlayer } from '../utils/playerAccess'
import { emitActivity, emitNotification } from '../utils/inbox'
import { readJson, writeJson } from '../utils/storage'
import { useAuth } from './AuthContext'
import { useMatches } from './MatchContext'
import { useTeams } from './TeamContext'
import { useTournaments } from './TournamentContext'

const FinanceContext = createContext(null)

function persist(store) {
  writeJson(AUTH_STORAGE_KEYS.financeStore, store)
}

function loadStore() {
  const stored = readJson(AUTH_STORAGE_KEYS.financeStore, null)
  if (stored?.payments) {
    return {
      payments: stored.payments,
      expenses: stored.expenses || [],
      replacementDecisions: stored.replacementDecisions || {},
      contributionMarks: stored.contributionMarks || {},
    }
  }
  return {
    payments: SEED_PAYMENTS,
    expenses: SEED_EXPENSES,
    replacementDecisions: {},
    contributionMarks: {},
  }
}

function relatedFromMatch(match, tournaments = []) {
  if (!match) return {}
  const tournament = tournaments.find((item) => item.id === match.tournamentId)
  return {
    matchId: match.id,
    matchTitle: match.title || `${match.home} vs ${match.away}`,
    teamId: match.homeTeamId || null,
    teamName: match.home || '',
    tournamentId: match.tournamentId || null,
    tournamentName: tournament?.name || match.tournamentName || '',
  }
}

export function FinanceProvider({ children }) {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches, addMatchCost, updateMatchCost, removeMatchCost, getMatch } = useMatches()
  const { tournaments } = useTournaments()
  const [store, setStore] = useState(loadStore)

  const save = useCallback((next) => {
    persist(next)
    setStore(next)
  }, [])

  const ownPlayer = useMemo(() => findOwnPlayer(players, user), [players, user])
  const accessCtx = useMemo(
    () => ({ teams, players, matches, ownPlayer }),
    [teams, players, matches, ownPlayer],
  )

  const visiblePayments = useMemo(
    () => store.payments.filter((item) => canViewPayment(item, user, accessCtx)),
    [accessCtx, store.payments, user],
  )

  const matchExpenses = useMemo(() => {
    const visibleMatches = getVisibleMatches(matches, user, teams, players)
    return derivedMatchExpenses(visibleMatches)
  }, [matches, players, teams, user])

  const financeExpenses = useMemo(
    () => store.expenses.filter((item) => canViewExpense(item, user, accessCtx)),
    [accessCtx, store.expenses, user],
  )

  const visibleExpenses = useMemo(() => {
    const derived = matchExpenses.filter((item) => canViewExpense(item, user, accessCtx))
    return [...derived, ...financeExpenses]
  }, [accessCtx, financeExpenses, matchExpenses, user])

  const summary = useMemo(
    () => financialSummary(visiblePayments, visibleExpenses),
    [visibleExpenses, visiblePayments],
  )

  const ledger = useMemo(
    () => (canViewFullLedger(user) ? buildLedger({ payments: visiblePayments, expenses: visibleExpenses }) : []),
    [user, visibleExpenses, visiblePayments],
  )

  const createPayment = useCallback(
    (payload) => {
      if (!canCreatePayment(user)) return null
      const match = payload.matchId ? getMatch(payload.matchId) : null
      const tournament = tournaments.find((item) => item.id === payload.tournamentId) || null
      const player = players.find((item) => item.id === payload.playerId) || null
      const team =
        teams.find((item) => item.id === (payload.teamId || player?.teamId)) || null
      const now = todayKey()
      const record = {
        id: createId('pay'),
        code: nextCode('PAY', store.payments),
        type: payload.type || 'Other',
        playerId: player?.id || payload.playerId || null,
        playerName: player?.name || payload.playerName || '',
        teamId: team?.id || payload.teamId || null,
        teamName: team?.name || payload.teamName || player?.teamName || '',
        matchId: match?.id || payload.matchId || null,
        matchTitle: match?.title || payload.matchTitle || '',
        tournamentId: tournament?.id || payload.tournamentId || null,
        tournamentName: tournament?.name || payload.tournamentName || '',
        description: payload.description?.trim() || payload.type || 'Payment',
        amount: Number(payload.amount || 0),
        status: payload.status || 'Pending',
        dueDate: payload.dueDateKey ? formatDateKey(payload.dueDateKey) : payload.dueDate || '',
        dueDateKey: payload.dueDateKey || '',
        paidDate: '',
        paidDateKey: '',
        method: '',
        reference: '',
        notes: payload.notes || '',
        createdDate: formatDateKey(now),
        createdDateKey: now,
        createdBy: user.name,
      }
      if (!canViewPayment(record, user, accessCtx) && user.role !== ROLES.ADMIN) {
        if (user.role === ROLES.ORGANIZER && record.type !== 'Tournament Registration' && !record.tournamentId) {
          return null
        }
      }
      const next = { ...store, payments: [record, ...store.payments] }
      save(next)
      if (record.status === 'Pending' || record.status === 'Overdue') {
        emitNotification({
          title: record.status === 'Overdue' ? 'Payment overdue' : 'Payment Pending',
          message: record.playerName
            ? `You have a pending contribution of ${formatINR(record.amount)} for ${record.matchTitle || record.description}.`
            : `A pending payment of ${formatINR(record.amount)} was created for ${record.description}.`,
          type: record.status === 'Overdue' ? 'payment-overdue' : 'payment-created',
          category: 'Payment',
          relatedEntityType: 'payment',
          relatedEntityId: record.id,
          route: `/finance/payments/${record.id}`,
          playerIds: record.playerId ? [record.playerId] : [],
          teamIds: record.playerId ? [] : [record.teamId].filter(Boolean),
          staffRoles: record.playerId ? [] : ['captain', 'manager'],
          actorName: user.name,
        })
      }
      emitActivity({
        title: 'Payment record created',
        description: `${formatINR(record.amount)} ${record.type} was created${record.playerName ? ` for ${record.playerName}` : ''}.`,
        category: 'Finance Activity',
        relatedEntityType: 'payment',
        relatedEntityId: record.id,
        route: `/finance/payments/${record.id}`,
        actorName: user.name,
        actorId: user.id,
        teamId: record.teamId,
      })
      return record
    },
    [accessCtx, getMatch, players, save, store, teams, tournaments, user],
  )

  const recordPayment = useCallback(
    (paymentId, { method, reference } = {}) => {
      const current = store.payments.find((item) => item.id === paymentId)
      if (!current || !canMutatePayment(current, user, accessCtx)) return null
      if (!canRecordPayment(user)) return null
      const now = todayKey()
      const updated = {
        ...current,
        status: 'Paid',
        method: method || 'Other',
        reference: reference?.trim() || current.reference || '',
        paidDate: formatDateKey(now),
        paidDateKey: now,
      }
      const next = {
        ...store,
        payments: store.payments.map((item) => (item.id === paymentId ? updated : item)),
      }
      save(next)
      emitNotification({
        title: 'Payment received',
        message: `${formatINR(updated.amount)} payment for ${updated.description} has been marked as paid.`,
        type: 'payment-received',
        category: 'Payment',
        relatedEntityType: 'payment',
        relatedEntityId: updated.id,
        route: `/finance/payments/${updated.id}`,
        playerIds: updated.playerId ? [updated.playerId] : [],
        teamIds: [updated.teamId].filter(Boolean),
        staffRoles: ['captain', 'manager'],
        actorName: user.name,
      })
      emitActivity({
        title: 'Payment received',
        description: `${formatINR(updated.amount)} was recorded as paid${updated.playerName ? ` for ${updated.playerName}` : ''}.`,
        category: 'Finance Activity',
        relatedEntityType: 'payment',
        relatedEntityId: updated.id,
        route: `/finance/payments/${updated.id}`,
        actorName: user.name,
        actorId: user.id,
        teamId: updated.teamId,
      })
      return updated
    },
    [accessCtx, save, store, user],
  )

  const updatePaymentStatus = useCallback(
    (paymentId, status) => {
      const current = store.payments.find((item) => item.id === paymentId)
      if (!current || !canMutatePayment(current, user, accessCtx)) return null
      const next = {
        ...store,
        payments: store.payments.map((item) =>
          item.id === paymentId ? { ...item, status } : item,
        ),
      }
      save(next)
      if (status === 'Overdue') {
        emitNotification({
          title: 'Payment overdue',
          message: current.playerName
            ? `Your ${formatINR(current.amount)} contribution for ${current.matchTitle || current.description} is overdue.`
            : `A payment of ${formatINR(current.amount)} for ${current.description} is overdue.`,
          type: 'payment-overdue',
          category: 'Payment',
          relatedEntityType: 'payment',
          relatedEntityId: current.id,
          route: `/finance/payments/${current.id}`,
          playerIds: current.playerId ? [current.playerId] : [],
          teamIds: current.playerId ? [] : [current.teamId].filter(Boolean),
          staffRoles: current.playerId ? [] : ['captain', 'manager'],
          actorName: user.name,
        })
      }
      return true
    },
    [accessCtx, save, store, user],
  )

  const createExpense = useCallback(
    (payload) => {
      if (!canManageExpenses(user)) return null
      const match = payload.matchId ? getMatch(payload.matchId) : null
      const tournament = tournaments.find((item) => item.id === payload.tournamentId) || null
      const team = teams.find((item) => item.id === payload.teamId) || null

      if (match) {
        if (user.role === ROLES.ORGANIZER && !match.tournamentId && match.source !== 'tournament') {
          return null
        }
        addMatchCost(match.id, {
          label: payload.description.trim(),
          amount: Number(payload.amount || 0),
        })
        return { source: 'match', matchId: match.id }
      }

      const now = payload.dateKey || todayKey()
      const record = {
        id: createId('exp'),
        code: nextCode('EXP', store.expenses, 2040),
        description: payload.description.trim(),
        category: payload.category || 'Other',
        amount: Number(payload.amount || 0),
        date: formatDateKey(now),
        dateKey: now,
        matchId: null,
        matchTitle: '',
        tournamentId: tournament?.id || null,
        tournamentName: tournament?.name || '',
        teamId: team?.id || payload.teamId || null,
        teamName: team?.name || payload.teamName || '',
        notes: payload.notes?.trim() || '',
        createdBy: user.name,
        createdDate: formatTimestamp(),
        source: 'finance',
      }
      if (user.role === ROLES.ORGANIZER && !record.tournamentId) return null
      const next = { ...store, expenses: [record, ...store.expenses] }
      save(next)
      emitNotification({
        title: 'Expense added',
        message: `${record.description} of ${formatINR(record.amount)} was added.`,
        type: 'expense-added',
        category: 'Finance',
        relatedEntityType: 'expense',
        relatedEntityId: record.id,
        route: '/finance/expenses',
        teamIds: [record.teamId].filter(Boolean),
        staffRoles: ['manager', 'captain'],
        roles: record.tournamentId ? [ROLES.ORGANIZER, ROLES.ADMIN] : [ROLES.ADMIN],
        includeAdmin: true,
        actorName: user.name,
      })
      emitActivity({
        title: 'Expense added',
        description: `${user.name} added ${record.description} (${formatINR(record.amount)}).`,
        category: 'Finance Activity',
        relatedEntityType: 'expense',
        relatedEntityId: record.id,
        route: '/finance/expenses',
        actorName: user.name,
        actorId: user.id,
        teamId: record.teamId,
      })
      return record
    },
    [addMatchCost, getMatch, save, store, teams, tournaments, user],
  )

  const updateExpense = useCallback(
    (expense, payload) => {
      if (!expense || !canMutateExpense(expense, user, accessCtx)) return false
      if (expense.source === 'match') {
        const match = getMatch(expense.matchId)
        if (!canManageCosts(match, user, teams)) return false
        updateMatchCost(expense.matchId, expense.matchCostId, {
          label: payload.description ?? expense.description,
          amount: payload.amount != null ? Number(payload.amount) : expense.amount,
        })
        return true
      }
      const next = {
        ...store,
        expenses: store.expenses.map((item) =>
          item.id === expense.id
            ? {
                ...item,
                description: payload.description ?? item.description,
                category: payload.category ?? item.category,
                amount: payload.amount != null ? Number(payload.amount) : item.amount,
                date: payload.dateKey ? formatDateKey(payload.dateKey) : item.date,
                dateKey: payload.dateKey || item.dateKey,
                notes: payload.notes ?? item.notes,
                tournamentId: payload.tournamentId !== undefined ? payload.tournamentId : item.tournamentId,
                tournamentName:
                  payload.tournamentId !== undefined
                    ? tournaments.find((entry) => entry.id === payload.tournamentId)?.name || ''
                    : item.tournamentName,
              }
            : item,
        ),
      }
      save(next)
      return true
    },
    [accessCtx, getMatch, save, store, teams, tournaments, updateMatchCost, user],
  )

  const deleteExpense = useCallback(
    (expense) => {
      if (!expense || !canDeleteExpense(user) || !canMutateExpense(expense, user, accessCtx)) {
        return false
      }
      if (expense.source === 'match') {
        const match = getMatch(expense.matchId)
        if (!canManageCosts(match, user, teams)) return false
        removeMatchCost(expense.matchId, expense.matchCostId)
        return true
      }
      save({
        ...store,
        expenses: store.expenses.filter((item) => item.id !== expense.id),
      })
      return true
    },
    [accessCtx, getMatch, removeMatchCost, save, store, teams, user],
  )

  const setReplacementDecision = useCallback(
    (matchId, outPlayerId, inPlayerId, decision) => {
      const key = replacementDecisionKey(matchId, outPlayerId, inPlayerId)
      save({
        ...store,
        replacementDecisions: { ...store.replacementDecisions, [key]: decision },
      })
    },
    [save, store],
  )

  const createMatchContributionPayments = useCallback(
    (matchId, participants) => {
      const match = getMatch(matchId)
      if (!match || !canCreateMatchContributions(user)) return { created: 0 }
      const related = relatedFromMatch(match, tournaments)
      const squadSize = match.squad?.snapshot?.length || participants.filter((item) => item.include).length
      const amount = Math.round(estimatedPerPlayer(match.costs, squadSize) * 100) / 100
      const existing = new Set(
        store.payments
          .filter((item) => item.matchId === matchId && item.status !== 'Cancelled')
          .map((item) => item.playerId),
      )
      const now = todayKey()
      const created = []
      participants.forEach((item) => {
        if (!item.include || !item.playerId || existing.has(item.playerId)) return
        created.push({
          id: createId('pay'),
          code: nextCode('PAY', [...store.payments, ...created]),
          type: 'Match Contribution',
          playerId: item.playerId,
          playerName: item.name,
          ...related,
          description: 'Match Contribution',
          amount,
          status: item.status === 'Pending Review' ? 'Pending Review' : 'Pending',
          dueDate: match.date,
          dueDateKey: match.dateKey || now,
          paidDate: '',
          paidDateKey: '',
          method: '',
          reference: '',
          notes: item.note || '',
          createdDate: formatDateKey(now),
          createdDateKey: now,
          createdBy: user.name,
        })
      })
      if (!created.length) {
        return { created: 0 }
      }
      save({
        ...store,
        payments: [...created, ...store.payments],
        contributionMarks: { ...store.contributionMarks, [matchId]: formatTimestamp() },
      })
      return { created: created.length }
    },
    [getMatch, save, store, tournaments, user],
  )

  const paymentsForPlayer = useCallback(
    (player) => {
      if (!player) return []
      return visiblePayments.filter(
        (item) => item.playerId === player.id || item.playerName === player.name,
      )
    },
    [visiblePayments],
  )

  const paymentsForMatch = useCallback(
    (matchId) => visiblePayments.filter((item) => item.matchId === matchId),
    [visiblePayments],
  )

  const getTeamSummary = useCallback(
    (team) => {
      if (!canViewTeamFinance(team, user) && user?.role !== ROLES.ADMIN) {
        return { collected: 0, pending: 0, expenses: 0, net: 0 }
      }
      return teamFinancialSummary(team, visiblePayments, visibleExpenses)
    },
    [user, visibleExpenses, visiblePayments],
  )

  const getTournamentSummary = useCallback(
    (tournament) => tournamentFinancialSummary(tournament, visiblePayments, visibleExpenses),
    [visibleExpenses, visiblePayments],
  )

  const value = useMemo(
    () => ({
      payments: visiblePayments,
      allPayments: store.payments,
      expenses: visibleExpenses,
      financeExpenses,
      ledger,
      summary,
      replacementDecisions: store.replacementDecisions,
      contributionMarks: store.contributionMarks,
      ownPlayer,
      createPayment,
      recordPayment,
      updatePaymentStatus,
      createExpense,
      updateExpense,
      deleteExpense,
      setReplacementDecision,
      createMatchContributionPayments,
      paymentsForPlayer,
      paymentsForMatch,
      getTeamSummary,
      getTournamentSummary,
      effectiveStatus: effectivePaymentStatus,
      displayDate,
    }),
    [
      createExpense,
      createMatchContributionPayments,
      createPayment,
      deleteExpense,
      financeExpenses,
      getTeamSummary,
      getTournamentSummary,
      ledger,
      ownPlayer,
      paymentsForMatch,
      paymentsForPlayer,
      recordPayment,
      setReplacementDecision,
      store.contributionMarks,
      store.payments,
      store.replacementDecisions,
      summary,
      updateExpense,
      updatePaymentStatus,
      visibleExpenses,
      visiblePayments,
    ],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider')
  }
  return context
}
