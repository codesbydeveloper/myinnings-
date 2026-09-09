import { ROLES, TOURNAMENT_WIP } from './constants'
import { getVisibleMatches } from './matchAccess'
import { getVisiblePlayers } from './playerAccess'
import { getVisibleTeams, isAdmin, isOrganizer, isPlayer } from './teamAccess'

export const REPORT_SECTIONS = [
  { id: 'overview', to: '/reports', label: 'Overview', end: true },
  { id: 'matches', to: '/reports/matches', label: 'Matches' },
  { id: 'teams', to: '/reports/teams', label: 'Teams' },
  { id: 'players', to: '/reports/players', label: 'Players' },
  { id: 'tournaments', to: '/reports/tournaments', label: 'Tournaments' },
  { id: 'finance', to: '/reports/finance', label: 'Finance' },
  { id: 'grounds', to: '/reports/grounds', label: 'Grounds' },
]

const SECTION_ROLES = {
  overview: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER, ROLES.PLAYER],
  matches: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER, ROLES.PLAYER],
  teams: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER],
  players: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.PLAYER],
  tournaments: [ROLES.ADMIN, ROLES.ORGANIZER, ROLES.MANAGER, ROLES.CAPTAIN],
  finance: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER, ROLES.PLAYER],
  grounds: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER],
}

export function canAccessReport(role, section = 'overview') {
  if (TOURNAMENT_WIP && section === 'tournaments') return false
  return (SECTION_ROLES[section] || []).includes(role)
}

export function reportSectionsFor(role) {
  return REPORT_SECTIONS.filter((item) => canAccessReport(role, item.id))
}

export function defaultReportPath(role) {
  return reportSectionsFor(role)[0]?.to || '/dashboard'
}

export function getVisibleTournaments(tournaments = [], user, teams = [], players = []) {
  if (!user) return []
  if (isAdmin(user.role)) return tournaments
  if (isOrganizer(user.role)) {
    return tournaments.filter(
      (item) => item.organizerId === user.id || item.organizer === user.name,
    )
  }
  const teamIds = new Set(getVisibleTeams(teams, players, user).map((team) => team.id))
  return tournaments.filter((item) =>
    (item.registrations || []).some((entry) => teamIds.has(entry.teamId)),
  )
}

export function getVisibleBookings(bookings = [], user, matches = [], teams = [], players = []) {
  if (!user) return []
  if (isAdmin(user.role)) return bookings
  const visibleMatches = getVisibleMatches(matches, user, teams, players)
  const matchIds = new Set(visibleMatches.map((item) => item.id))

  if (isOrganizer(user.role)) {
    return bookings.filter(
      (item) =>
        item.tournamentId ||
        item.type === 'Tournament' ||
        item.createdBy === user.name ||
        matchIds.has(item.matchId),
    )
  }

  if (isPlayer(user.role)) {
    return bookings.filter((item) => matchIds.has(item.matchId))
  }

  return bookings.filter(
    (item) => item.createdBy === user.name || matchIds.has(item.matchId),
  )
}

export function getScopedPlayers(players = [], teams = [], user) {
  return getVisiblePlayers(players, teams, user)
}
