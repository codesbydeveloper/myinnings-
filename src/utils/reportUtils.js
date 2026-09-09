import { inferExpenseCategory } from '../data/financeModel'
import { approvedRegistrations, pendingRegistrations, tournamentMatches } from '../data/tournamentModel'
import { formatINR } from './helpers'

export const REPORT_RANGES = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '3m', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
]

export const CHART_COLORS = ['#059669', '#0f172a', '#d97706', '#0284c7', '#7c3aed', '#dc2626', '#64748b']

export function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function safePercent(part, total) {
  const numerator = safeNumber(part)
  const denominator = safeNumber(total)
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 100)
}

export function toDateKey(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${parsed.getFullYear()}-${month}-${day}`
}

export function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function rangeBounds(range, now = new Date()) {
  const today = startOfDay(now)
  const end = startOfDay(now)
  if (!range || range.preset === 'all') return { start: null, end: null, label: 'All Time' }

  if (range.preset === 'custom') {
    const start = range.start ? startOfDay(new Date(`${range.start}T00:00:00`)) : null
    const customEnd = range.end ? startOfDay(new Date(`${range.end}T00:00:00`)) : end
    return {
      start: start && !Number.isNaN(start.getTime()) ? start : null,
      end: customEnd && !Number.isNaN(customEnd.getTime()) ? customEnd : end,
      label: range.start && range.end ? `${range.start} to ${range.end}` : 'Custom Range',
    }
  }

  const start = startOfDay(now)
  if (range.preset === '7d') start.setDate(today.getDate() - 6)
  else if (range.preset === '30d') start.setDate(today.getDate() - 29)
  else if (range.preset === '3m') start.setMonth(today.getMonth() - 3)
  else if (range.preset === 'year') start.setMonth(0, 1)
  else return { start: null, end: null, label: 'All Time' }

  const meta = REPORT_RANGES.find((item) => item.id === range.preset)
  return { start, end, label: meta?.label || 'Selected period' }
}

export function formatRangeLabel(range, now = new Date()) {
  return rangeBounds(range, now).label
}

export function inDateRange(dateValue, bounds) {
  if (!bounds?.start && !bounds?.end) return true
  const key = toDateKey(dateValue)
  if (!key) return false
  const date = startOfDay(new Date(`${key}T00:00:00`))
  if (Number.isNaN(date.getTime())) return false
  if (bounds.start && date < bounds.start) return false
  if (bounds.end && date > bounds.end) return false
  return true
}

export function matchDateValue(match) {
  return match?.dateKey || match?.date || ''
}

export function paymentDateValue(payment) {
  return payment?.paidDateKey || payment?.createdDateKey || payment?.dueDateKey || payment?.paidDate || payment?.createdDate || ''
}

export function expenseDateValue(expense) {
  return expense?.dateKey || expense?.date || expense?.createdDate || ''
}

export function bookingDateValue(booking) {
  return booking?.dateKey || booking?.date || ''
}

export function tournamentDateValue(tournament) {
  return tournament?.startDateKey || tournament?.createdDate || tournament?.startDate || ''
}

export function filterByRange(items, getDate, bounds) {
  return (items || []).filter((item) => inDateRange(getDate(item), bounds))
}

export function matchWinner(match) {
  if (!match || match.status !== 'Completed') return ''
  if (match.resultDetail?.winner) return match.resultDetail.winner
  const text = match.result || match.resultDetail?.summary || ''
  if (/drawn|no result/i.test(text) || match.resultDetail?.type === 'Match Drawn') return ''
  if (/won/i.test(text)) return text.split(' won')[0]
  return ''
}

export function isDrawnMatch(match) {
  if (!match || match.status !== 'Completed') return false
  return (
    match.resultDetail?.type === 'Match Drawn' ||
    match.resultDetail?.type === 'No Result' ||
    /drawn|no result/i.test(match.result || match.resultDetail?.summary || '')
  )
}

export function involvesTeam(match, team) {
  if (!match || !team) return false
  return (
    match.homeTeamId === team.id ||
    match.awayTeamId === team.id ||
    match.home === team.name ||
    match.away === team.name
  )
}

export function countBy(items, getKey) {
  return (items || []).reduce((map, item) => {
    const key = getKey(item) || 'Other'
    map[key] = (map[key] || 0) + 1
    return map
  }, {})
}

export function matchOverview(matches = []) {
  const upcoming = matches.filter((item) => item.status === 'Upcoming' || item.status === 'Live').length
  const completed = matches.filter((item) => item.status === 'Completed').length
  const cancelled = matches.filter((item) => item.status === 'Cancelled').length
  return {
    total: matches.length,
    upcoming,
    completed,
    cancelled,
    live: matches.filter((item) => item.status === 'Live').length,
  }
}

export function teamMatchRecord(team, matches = []) {
  const related = matches.filter((match) => involvesTeam(match, team))
  const completed = related.filter((match) => match.status === 'Completed')
  let wins = 0
  let losses = 0
  let draws = 0
  completed.forEach((match) => {
    if (isDrawnMatch(match)) {
      draws += 1
      return
    }
    const winner = matchWinner(match)
    if (winner && winner === team.name) wins += 1
    else if (winner) losses += 1
  })
  const played = wins + losses + draws
  const squadSizes = related
    .map((match) => match.squad?.selectedIds?.length || match.squad?.size || 0)
    .filter((value) => value > 0)
  const averageSquadSize = squadSizes.length
    ? Math.round(squadSizes.reduce((sum, value) => sum + value, 0) / squadSizes.length)
    : 0

  return {
    teamId: team.id,
    teamName: team.name,
    totalMatches: related.length,
    wins,
    losses,
    draws,
    played,
    winPercentage: safePercent(wins, played),
    activePlayers: safeNumber(team.available || team.players),
    averageSquadSize,
  }
}

export function matchesOverTime(matches = []) {
  const buckets = {}
  matches.forEach((match) => {
    const key = toDateKey(matchDateValue(match)).slice(0, 7)
    if (!key) return
    buckets[key] = (buckets[key] || 0) + 1
  })
  return Object.entries(buckets)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => ({
      label: formatMonth(month),
      month,
      matches: count,
    }))
}

export function formatMonth(yearMonth) {
  const [year, month] = String(yearMonth).split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(date.getTime())) return yearMonth
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export function availabilityBreakdown(matches = [], playerIds = []) {
  const counts = { Available: 0, 'Not Available': 0, Pending: 0 }
  matches.forEach((match) => {
    const map = match.availability || {}
    const ids = playerIds.length ? playerIds : Object.keys(map)
    ids.forEach((id) => {
      const status = map[id] || 'Pending'
      if (status === 'Available') counts.Available += 1
      else if (status === 'Not Available') counts['Not Available'] += 1
      else counts.Pending += 1
    })
  })
  const total = counts.Available + counts['Not Available'] + counts.Pending
  return {
    ...counts,
    total,
    availableRate: safePercent(counts.Available, total),
    unavailableRate: safePercent(counts['Not Available'], total),
    pendingRate: safePercent(counts.Pending, total),
  }
}

export function playerPerformance(player, matches = []) {
  if (!player) {
    return {
      available: 0,
      selected: 0,
      played: 0,
      pending: 0,
      unavailable: 0,
      considered: 0,
      availabilityRate: 0,
      selectionRate: 0,
    }
  }

  const related = matches.filter(
    (match) =>
      match.homeTeamId === player.teamId ||
      match.home === player.teamName ||
      match.awayTeamId === player.teamId ||
      match.away === player.teamName,
  )

  let available = 0
  let selected = 0
  let played = 0
  let pending = 0
  let unavailable = 0

  related.forEach((match) => {
    const status = match.availability?.[player.id] || 'Pending'
    if (status === 'Available') available += 1
    else if (status === 'Not Available') unavailable += 1
    else pending += 1

    const picked =
      match.squad?.selectedIds?.includes(player.id) ||
      match.squad?.snapshot?.some((item) => item.id === player.id)
    if (picked) {
      selected += 1
      if (match.status === 'Completed') played += 1
    }
  })

  return {
    available,
    selected,
    played,
    pending,
    unavailable,
    considered: related.length,
    availabilityRate: safePercent(available, related.length),
    selectionRate: safePercent(selected, related.length),
  }
}

export function tournamentProgress(tournament, matches = []) {
  const related = tournamentMatches(matches, tournament?.id)
  const completed = related.filter((item) => item.status === 'Completed').length
  const remaining = related.filter((item) => !['Completed', 'Cancelled'].includes(item.status)).length
  const registered = (tournament?.registrations || []).filter((item) => item.status !== 'Rejected').length
  return {
    registered,
    approved: approvedRegistrations(tournament).length,
    pending: pendingRegistrations(tournament).length,
    totalMatches: related.length,
    completed,
    remaining,
    progress: safePercent(completed, related.length),
  }
}

export function classifyTournament(tournament) {
  const status = tournament?.status || ''
  if (status === 'Completed') return 'completed'
  if (status === 'Cancelled' || status === 'Draft') return status === 'Draft' ? 'upcoming' : 'cancelled'
  if (['Ongoing', 'Fixtures Generated'].includes(status)) return 'active'
  return 'upcoming'
}

export function financeTotals(payments = [], expenses = [], matches = [], statusOf) {
  const collected = payments
    .filter((item) => (statusOf ? statusOf(item) : item.status) === 'Paid')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0)
  const pending = payments
    .filter((item) => ['Pending', 'Pending Review'].includes(statusOf ? statusOf(item) : item.status))
    .reduce((sum, item) => sum + safeNumber(item.amount), 0)
  const overdue = payments
    .filter((item) => (statusOf ? statusOf(item) : item.status) === 'Overdue')
    .reduce((sum, item) => sum + safeNumber(item.amount), 0)
  const paidCount = payments.filter((item) => (statusOf ? statusOf(item) : item.status) === 'Paid').length
  const matchCosts = matches.reduce(
    (sum, match) => sum + (match.costs || []).reduce((inner, cost) => inner + safeNumber(cost.amount), 0),
    0,
  )
  const expenseTotal = expenses.reduce((sum, item) => sum + safeNumber(item.amount), 0)

  return {
    matchCosts,
    expenses: expenseTotal,
    collected,
    pending,
    overdue,
    paidCount,
    pendingCount: payments.filter((item) =>
      ['Pending', 'Pending Review', 'Overdue'].includes(statusOf ? statusOf(item) : item.status),
    ).length,
  }
}

export function expenseBreakdown(expenses = []) {
  const buckets = { Ground: 0, Umpire: 0, Refreshments: 0, Other: 0 }
  expenses.forEach((item) => {
    const category = item.category || inferExpenseCategory(item.description || item.label)
    if (category === 'Ground') buckets.Ground += safeNumber(item.amount)
    else if (category === 'Umpire') buckets.Umpire += safeNumber(item.amount)
    else if (category === 'Refreshments') buckets.Refreshments += safeNumber(item.amount)
    else buckets.Other += safeNumber(item.amount)
  })
  return Object.entries(buckets).map(([name, value]) => ({ name, value }))
}

export function paymentStatusBreakdown(payments = [], statusOf) {
  const buckets = { Paid: 0, Pending: 0, Overdue: 0 }
  payments.forEach((item) => {
    const status = statusOf ? statusOf(item) : item.status
    if (status === 'Paid') buckets.Paid += 1
    else if (status === 'Overdue') buckets.Overdue += 1
    else if (['Pending', 'Pending Review'].includes(status)) buckets.Pending += 1
  })
  return Object.entries(buckets).map(([name, value]) => ({ name, value }))
}

export function collectedOverTime(payments = [], statusOf) {
  const buckets = {}
  payments
    .filter((item) => (statusOf ? statusOf(item) : item.status) === 'Paid')
    .forEach((item) => {
      const key = toDateKey(paymentDateValue(item)).slice(0, 7)
      if (!key) return
      buckets[key] = (buckets[key] || 0) + safeNumber(item.amount)
    })
  return Object.entries(buckets)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, amount]) => ({
      label: formatMonth(month),
      month,
      amount,
    }))
}

export function groundUsage(grounds = [], bookings = []) {
  return grounds
    .map((ground) => {
      const related = bookings.filter(
        (item) => item.groundId === ground.id || item.groundName === ground.name,
      )
      return {
        groundId: ground.id,
        groundName: ground.name,
        bookings: related.length,
        match: related.filter((item) => item.type === 'Match').length,
        tournament: related.filter((item) => item.type === 'Tournament').length,
        practice: related.filter((item) => item.type === 'Practice').length,
        other: related.filter((item) => !['Match', 'Tournament', 'Practice'].includes(item.type)).length,
      }
    })
    .sort((left, right) => right.bookings - left.bookings)
}

export function mostUsedGround(usage = []) {
  return usage.find((item) => item.bookings > 0) || null
}

export function bookingStatusCounts(bookings = []) {
  return {
    upcoming: bookings.filter((item) => item.status === 'Upcoming').length,
    completed: bookings.filter((item) => item.status === 'Completed').length,
    cancelled: bookings.filter((item) => item.status === 'Cancelled').length,
    total: bookings.length,
  }
}

export function money(value) {
  return formatINR(safeNumber(value))
}

export function downloadCsv(filename, rows, columns) {
  const header = columns.map((column) => csvCell(column.label)).join(',')
  const body = rows
    .map((row) => columns.map((column) => csvCell(column.value(row))).join(','))
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}
