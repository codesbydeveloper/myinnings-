import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import { useGrounds } from '../context/GroundContext'
import { useMatches } from '../context/MatchContext'
import { useReportRange } from '../context/ReportContext'
import { useTeams } from '../context/TeamContext'
import { useTournaments } from '../context/TournamentContext'
import { getVisibleMatches } from '../utils/matchAccess'
import { findOwnPlayer } from '../utils/playerAccess'
import {
  getScopedPlayers,
  getVisibleBookings,
  getVisibleTournaments,
} from '../utils/reportAccess'
import {
  availabilityBreakdown,
  bookingDateValue,
  bookingStatusCounts,
  classifyTournament,
  collectedOverTime,
  expenseBreakdown,
  expenseDateValue,
  filterByRange,
  financeTotals,
  groundUsage,
  matchDateValue,
  matchesOverTime,
  matchOverview,
  mostUsedGround,
  paymentDateValue,
  paymentStatusBreakdown,
  playerPerformance,
  teamMatchRecord,
  tournamentDateValue,
  tournamentProgress,
} from '../utils/reportUtils'
import { getVisibleTeams } from '../utils/teamAccess'

export function useReportData() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { payments, expenses, ledger, effectiveStatus } = useFinance()
  const { grounds, bookings } = useGrounds()
  const { range, bounds, rangeLabel } = useReportRange()

  return useMemo(() => {
    const visibleTeams = getVisibleTeams(teams, players, user)
    const visiblePlayers = getScopedPlayers(players, teams, user)
    const visibleMatches = getVisibleMatches(matches, user, teams, players)
    const visibleTournaments = getVisibleTournaments(tournaments, user, teams, players)
    const visibleBookings = getVisibleBookings(bookings, user, matches, teams, players)
    const ownPlayer = findOwnPlayer(players, user)

    const rangedMatches = filterByRange(visibleMatches, matchDateValue, bounds)
    const rangedPayments = filterByRange(payments, paymentDateValue, bounds)
    const rangedExpenses = filterByRange(expenses, expenseDateValue, bounds)
    const rangedBookings = filterByRange(visibleBookings, bookingDateValue, bounds)
    const rangedTournaments = filterByRange(visibleTournaments, tournamentDateValue, bounds)
    const rangedLedger = filterByRange(ledger, (item) => item.dateKey || item.date, bounds)

    const overview = matchOverview(rangedMatches)
    const teamRows = visibleTeams.map((team) => teamMatchRecord(team, rangedMatches))
    const usage = groundUsage(grounds, rangedBookings)
    const bookingCounts = bookingStatusCounts(rangedBookings)
    const finance = financeTotals(rangedPayments, rangedExpenses, rangedMatches, effectiveStatus)
    const playerStats = ownPlayer ? playerPerformance(ownPlayer, rangedMatches) : null
    const availability = availabilityBreakdown(
      rangedMatches,
      visiblePlayers.map((player) => player.id),
    )

    const tournamentOverview = {
      total: rangedTournaments.length,
      upcoming: rangedTournaments.filter((item) => classifyTournament(item) === 'upcoming').length,
      active: rangedTournaments.filter((item) => classifyTournament(item) === 'active').length,
      completed: rangedTournaments.filter((item) => classifyTournament(item) === 'completed').length,
    }

    return {
      user,
      ownPlayer,
      range,
      bounds,
      rangeLabel,
      teams: visibleTeams,
      players: visiblePlayers,
      matches: rangedMatches,
      allVisibleMatches: visibleMatches,
      tournaments: rangedTournaments,
      allVisibleTournaments: visibleTournaments,
      payments: rangedPayments,
      expenses: rangedExpenses,
      ledger: rangedLedger,
      grounds,
      bookings: rangedBookings,
      overview,
      teamRows,
      usage,
      mostUsed: mostUsedGround(usage),
      bookingCounts,
      finance,
      playerStats,
      availability,
      tournamentOverview,
      tournamentRows: visibleTournaments.map((item) => ({
        ...item,
        progress: tournamentProgress(item, visibleMatches),
      })),
      matchTrend: matchesOverTime(rangedMatches),
      financeTrend: collectedOverTime(rangedPayments, effectiveStatus),
      expenseSlices: expenseBreakdown(rangedExpenses),
      paymentSlices: paymentStatusBreakdown(rangedPayments, effectiveStatus),
      effectiveStatus,
    }
  }, [
    bookings,
    bounds,
    effectiveStatus,
    expenses,
    grounds,
    ledger,
    matches,
    payments,
    players,
    range,
    rangeLabel,
    teams,
    tournaments,
    user,
  ])
}
