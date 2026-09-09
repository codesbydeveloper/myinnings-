import { formatDateKey } from './matchModel'
import { formatINR } from '../utils/helpers'

export const DATE_FILTERS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
]

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDateKey(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return todayKey(parsed)
}

export function displayDate(dateKey, fallback = '') {
  if (!dateKey) return fallback
  return formatDateKey(dateKey) || fallback
}

export function inferExpenseCategory(label = '') {
  const text = String(label).toLowerCase()
  if (text.includes('ground') || text.includes('venue') || text.includes('booking')) return 'Ground'
  if (text.includes('umpire')) return 'Umpire'
  if (text.includes('equipment') || text.includes('kit')) return 'Equipment'
  if (text.includes('refresh') || text.includes('water') || text.includes('food')) return 'Refreshments'
  if (text.includes('transport') || text.includes('travel')) return 'Transportation'
  return 'Other'
}

export function effectivePaymentStatus(payment, nowKey = todayKey()) {
  if (!payment) return 'Pending'
  if (payment.status === 'Pending' && payment.dueDateKey && payment.dueDateKey < nowKey) {
    return 'Overdue'
  }
  return payment.status
}

export function nextCode(prefix, items = [], start = 1020) {
  const numbers = items
    .map((item) => Number(String(item.code || '').replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
  const max = numbers.length ? Math.max(...numbers) : start
  return `${prefix}-${max + 1}`
}

export function sumAmount(items = []) {
  return items.reduce((total, item) => total + Number(item.amount || 0), 0)
}

export function matchesDateFilter(dateKey, filter, now = new Date()) {
  if (!filter || filter === 'all') return true
  if (!dateKey) return filter === 'all'
  const date = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (filter === 'today') return dateKey === todayKey(today)

  if (filter === 'week') {
    const day = today.getDay() || 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + 1)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return date >= monday && date <= sunday
  }

  if (filter === 'month') {
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  return true
}

export function paymentSearchText(payment) {
  return [
    payment.code,
    payment.id,
    payment.playerName,
    payment.teamName,
    payment.matchTitle,
    payment.tournamentName,
    payment.description,
    payment.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function expenseSearchText(expense) {
  return [
    expense.code,
    expense.id,
    expense.description,
    expense.category,
    expense.matchTitle,
    expense.tournamentName,
    expense.teamName,
    expense.createdBy,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function ledgerSearchText(entry) {
  return [
    entry.code,
    entry.id,
    entry.description,
    entry.relatedEntity,
    entry.type,
    entry.teamName,
    entry.matchTitle,
    entry.tournamentName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function derivedMatchExpenses(matches = []) {
  return matches.flatMap((match) =>
    (match.costs || []).map((cost) => ({
      id: `match-exp-${match.id}-${cost.id}`,
      code: `MEX-${String(cost.id).replace(/^cost-/, '').slice(0, 8)}`.toUpperCase(),
      description: cost.label,
      category: inferExpenseCategory(cost.label),
      amount: Number(cost.amount || 0),
      date: match.date,
      dateKey: match.dateKey || toDateKey(match.date),
      matchId: match.id,
      matchTitle: match.title || `${match.home} vs ${match.away}`,
      tournamentId: match.tournamentId || null,
      tournamentName: match.tournamentName || '',
      teamId: match.homeTeamId || null,
      teamName: match.home || '',
      notes: '',
      createdBy: 'Match costs',
      createdDate: match.createdDate || match.date,
      source: 'match',
      matchCostId: cost.id,
    })),
  )
}

export function buildLedger({ payments = [], expenses = [], nowKey = todayKey() }) {
  const entries = []

  payments.forEach((payment) => {
    const status = effectivePaymentStatus(payment, nowKey)
    if (status !== 'Paid') return
    entries.push({
      id: `txn-pay-${payment.id}`,
      code: payment.code?.replace('PAY', 'TXN') || `TXN-${payment.id}`,
      date: payment.paidDate || payment.createdDate,
      dateKey: payment.paidDateKey || payment.createdDateKey || nowKey,
      description: payment.description || payment.type,
      relatedEntity: payment.playerName || payment.teamName || '—',
      type: payment.type === 'Other' ? 'Other Income' : 'Payment Received',
      income: Number(payment.amount || 0),
      expense: 0,
      teamId: payment.teamId,
      teamName: payment.teamName,
      matchId: payment.matchId,
      matchTitle: payment.matchTitle,
      tournamentId: payment.tournamentId,
      tournamentName: payment.tournamentName,
      paymentId: payment.id,
    })
  })

  expenses.forEach((expense) => {
    const isTournament = Boolean(expense.tournamentId) && !expense.matchId
    const isMatch = Boolean(expense.matchId)
    entries.push({
      id: `txn-exp-${expense.id}`,
      code: expense.code?.replace(/^(EXP|MEX)/, 'TXN') || `TXN-${expense.id}`,
      date: expense.date,
      dateKey: expense.dateKey || toDateKey(expense.date),
      description: expense.description,
      relatedEntity: expense.matchTitle || expense.tournamentName || expense.teamName || '—',
      type: isTournament ? 'Tournament Expense' : isMatch ? 'Match Expense' : 'Other Expense',
      income: 0,
      expense: Number(expense.amount || 0),
      teamId: expense.teamId,
      teamName: expense.teamName,
      matchId: expense.matchId,
      matchTitle: expense.matchTitle,
      tournamentId: expense.tournamentId,
      tournamentName: expense.tournamentName,
      expenseId: expense.id,
    })
  })

  const sorted = entries.sort((a, b) => {
    const key = String(a.dateKey || '').localeCompare(String(b.dateKey || ''))
    if (key !== 0) return key
    return String(a.id).localeCompare(String(b.id))
  })

  let running = 0
  return sorted.map((entry) => {
    running += Number(entry.income || 0) - Number(entry.expense || 0)
    return { ...entry, balance: running }
  })
}

export function financialSummary(payments = [], expenses = [], nowKey = todayKey()) {
  const collected = sumAmount(
    payments.filter((item) => effectivePaymentStatus(item, nowKey) === 'Paid'),
  )
  const pending = sumAmount(
    payments.filter((item) =>
      ['Pending', 'Overdue', 'Pending Review'].includes(effectivePaymentStatus(item, nowKey)),
    ),
  )
  const totalExpenses = sumAmount(expenses)
  return {
    collected,
    pending,
    expenses: totalExpenses,
    net: collected - totalExpenses,
  }
}

export function teamFinancialSummary(team, payments = [], expenses = [], nowKey = todayKey()) {
  if (!team) {
    return { collected: 0, pending: 0, expenses: 0, net: 0 }
  }
  const teamPayments = payments.filter(
    (item) => item.teamId === team.id && item.type !== 'Tournament Registration',
  )
  const teamExpenses = expenses.filter(
    (item) =>
      item.teamId === team.id ||
      (item.matchTitle && item.matchTitle.includes(team.name)),
  )
  const registrationPaid = sumAmount(
    payments.filter(
      (item) =>
        item.teamId === team.id &&
        item.type === 'Tournament Registration' &&
        effectivePaymentStatus(item, nowKey) === 'Paid',
    ),
  )
  const summary = financialSummary(teamPayments, teamExpenses, nowKey)
  return {
    ...summary,
    expenses: summary.expenses + registrationPaid,
    net: summary.collected - (summary.expenses + registrationPaid),
    registrationPaid,
  }
}

export function tournamentFinancialSummary(tournament, payments = [], expenses = [], nowKey = todayKey()) {
  if (!tournament) {
    return { income: 0, pending: 0, expenses: 0, net: 0 }
  }
  const relatedPayments = payments.filter((item) => item.tournamentId === tournament.id)
  const relatedExpenses = expenses.filter((item) => item.tournamentId === tournament.id)
  const income = sumAmount(
    relatedPayments.filter((item) => effectivePaymentStatus(item, nowKey) === 'Paid'),
  )
  const pending = sumAmount(
    relatedPayments.filter((item) =>
      ['Pending', 'Overdue', 'Pending Review'].includes(effectivePaymentStatus(item, nowKey)),
    ),
  )
  const totalExpenses = sumAmount(relatedExpenses)
  return {
    income,
    pending,
    expenses: totalExpenses,
    net: income - totalExpenses,
  }
}

export function replacementDecisionKey(matchId, outPlayerId, inPlayerId) {
  return `${matchId}:${outPlayerId}:${inPlayerId}`
}

export function formatMoney(amount) {
  return formatINR(amount)
}

export function dashboardTransaction(entry) {
  const isIncome = Number(entry.income || 0) > 0
  return {
    id: entry.id,
    title: entry.relatedEntity || entry.description,
    category: entry.description,
    date: entry.date,
    amount: isIncome ? entry.income : entry.expense,
    type: isIncome ? 'in' : 'out',
    status: isIncome ? 'Received' : 'Expense',
  }
}
