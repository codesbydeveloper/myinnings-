import { ROLES } from './constants'
import {
  getVisibleTeams,
  isAdmin,
  isOrganizer,
  isPlayer,
  isTeamCaptain,
  isTeamManager,
} from './teamAccess'

function homeTeam(match, teams) {
  return teams.find((team) => team.id === match.homeTeamId || team.name === match.home) ?? null
}

function involvesTeam(match, team) {
  if (!team) return false
  return (
    match.homeTeamId === team.id ||
    match.awayTeamId === team.id ||
    match.home === team.name ||
    match.away === team.name
  )
}

export function getMatchableTeams(teams, players, user) {
  if (!user) return []
  if (isAdmin(user.role)) return teams.filter((team) => team.status === 'Active')
  if (isOrganizer(user.role) || isPlayer(user.role)) return []
  return getVisibleTeams(teams, players, user).filter((team) => team.status === 'Active')
}

export function getVisibleMatches(matches, user, teams, players) {
  if (!user) return []
  if (isAdmin(user.role)) return matches
  if (isOrganizer(user.role)) {
    return matches.filter((match) => match.source === 'tournament')
  }
  const allowed = getVisibleTeams(teams, players, user)
  return matches.filter((match) => allowed.some((team) => involvesTeam(match, team)))
}

export function canViewMatch(match, user, teams, players) {
  if (!match || !user) return false
  return getVisibleMatches([match], user, teams, players).length > 0
}

export function canCreateMatch(role) {
  return role === ROLES.CAPTAIN || role === ROLES.MANAGER || role === ROLES.ADMIN
}

export function canManageMatch(match, user, teams) {
  if (!match || !user) return false
  if (isAdmin(user.role)) return true
  if (isOrganizer(user.role) || isPlayer(user.role)) return false
  const team = homeTeam(match, teams)
  if (!team) return false
  if (user.role === ROLES.MANAGER) return isTeamManager(team, user)
  if (user.role === ROLES.CAPTAIN) return isTeamCaptain(team, user)
  return false
}

export function canEditMatch(match, user, teams) {
  if (!match || !user) return false
  if (['Completed', 'Cancelled'].includes(match.status)) return false
  if (isAdmin(user.role)) return true
  if (isOrganizer(user.role)) return match.source === 'tournament'
  return canManageMatch(match, user, teams)
}

export function canManageSquad(match, user, teams) {
  return (
    canManageMatch(match, user, teams) &&
    !['Completed', 'Cancelled'].includes(match.status)
  )
}

export function canManageCosts(match, user, teams) {
  return canManageMatch(match, user, teams)
}

export function canRecordResult(match, user, teams) {
  if (!match || !user) return false
  if (isPlayer(user.role)) return false
  if (isOrganizer(user.role)) return match.source === 'tournament'
  return canManageMatch(match, user, teams)
}

export function canCancelMatch(match, user, teams) {
  return canManageMatch(match, user, teams) && !['Completed', 'Cancelled'].includes(match.status)
}

export function canChangeMatchAvailability(match, player, user) {
  return Boolean(match && player && user && player.name === user.name)
}
