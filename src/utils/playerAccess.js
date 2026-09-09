import { ROLES } from './constants'
import {
  getVisibleTeams,
  isAdmin,
  isOrganizer,
  isPlayer,
  isTeamCaptain,
  isTeamManager,
} from './teamAccess'

export const BATTING_STYLES = ['Right-hand bat', 'Left-hand bat']

export const BOWLING_STYLES = [
  'Right-arm fast',
  'Right-arm medium',
  'Right-arm off break',
  'Left-arm orthodox',
  'Left-arm fast',
  'Does not bowl',
]

export const PLAYER_STATUSES = ['Active', 'Inactive', 'Suspended']

export function findOwnPlayer(players, user) {
  if (!user) return null
  const matches = players.filter((player) => player.name === user.name)
  return matches.find((player) => player.teamId) || matches[0] || null
}

export function getVisiblePlayers(players, teams, user) {
  if (!user) return []
  if (isAdmin(user.role)) return players
  if (isOrganizer(user.role)) {
    return players.filter((player) => Boolean(player.teamId))
  }
  if (isPlayer(user.role)) {
    return players.filter((player) => player.name === user.name)
  }

  const visibleIds = new Set(getVisibleTeams(teams, players, user).map((team) => team.id))

  if (user.role === ROLES.MANAGER) {
    return players.filter((player) => !player.teamId || visibleIds.has(player.teamId))
  }

  if (user.role === ROLES.CAPTAIN) {
    return players.filter((player) => visibleIds.has(player.teamId))
  }

  return players
}

export function canViewPlayer(player, user, teams, players) {
  if (!player || !user) return false
  return getVisiblePlayers(players, teams, user).some((item) => item.id === player.id)
}

export function canCreatePlayer(role) {
  return role === ROLES.MANAGER || role === ROLES.ADMIN || role === ROLES.CAPTAIN
}

export function canEditPlayer(player, user, teams) {
  if (!player || !user) return false
  if (isAdmin(user.role)) return true
  if (isOrganizer(user.role)) return false
  if (isPlayer(user.role)) return player.name === user.name
  if (user.role === ROLES.MANAGER) {
    if (!player.teamId) return true
    return teams.some((team) => team.id === player.teamId && isTeamManager(team, user))
  }
  if (user.role === ROLES.CAPTAIN) {
    return teams.some((team) => team.id === player.teamId && isTeamCaptain(team, user))
  }
  return false
}

export function canEditPlayerStatus(player, user, teams) {
  if (!player || !user) return false
  if (isAdmin(user.role)) return true
  if (user.role === ROLES.MANAGER) {
    return teams.some((team) => team.id === player.teamId && isTeamManager(team, user))
  }
  return false
}

export function canAssignPlayerTeam(user) {
  return user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN || user?.role === ROLES.CAPTAIN
}

export function canViewPlayerContact(player, user, teams) {
  if (!player || !user) return false
  if (isAdmin(user.role)) return true
  if (isOrganizer(user.role)) return false
  if (isPlayer(user.role)) return player.name === user.name
  if (user.role === ROLES.MANAGER) {
    if (!player.teamId) return true
    return teams.some((team) => team.id === player.teamId && isTeamManager(team, user))
  }
  if (user.role === ROLES.CAPTAIN) {
    return teams.some((team) => team.id === player.teamId && isTeamCaptain(team, user))
  }
  return false
}

export function canViewPlayerPayments(player, user, teams) {
  return canViewPlayerContact(player, user, teams)
}

export function canChangePlayerAvailability(player, user) {
  return Boolean(player && user && player.name === user.name)
}

export function statusOptionsFor(user) {
  if (isAdmin(user?.role)) return PLAYER_STATUSES
  if (user?.role === ROLES.MANAGER) return ['Active', 'Inactive']
  return []
}
