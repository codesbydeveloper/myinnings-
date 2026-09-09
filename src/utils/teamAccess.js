import { ROLES } from './constants'

export const TEAM_TYPES = ['Club', 'Corporate', 'Tournament', 'Academy', 'Community']

export const TEAM_STATUSES = ['Active', 'Inactive', 'Archived']

export const PLAYER_TEAM_ROLES = ['Captain', 'Vice Captain', 'Player']

export const PLAYING_POSITIONS = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper']

export const AVAILABILITY_STATUSES = ['Available', 'Not Available', 'Pending']

export function isAdmin(role) {
  return role === ROLES.ADMIN
}

export function isOrganizer(role) {
  return role === ROLES.ORGANIZER
}

export function isPlayer(role) {
  return role === ROLES.PLAYER
}

export function canCreateTeam(role) {
  return role === ROLES.MANAGER || role === ROLES.ADMIN
}

export function isTeamCaptain(team, user) {
  if (!team || !user) return false
  return (
    team.captain === user.name ||
    team.assignedCaptains?.includes(user.name)
  )
}

export function isTeamManager(team, user) {
  if (!team || !user) return false
  return team.manager === user.name
}

export function isOnRoster(players, teamId, userName) {
  return players.some(
    (player) => player.teamId === teamId && player.name === userName,
  )
}

export function canEditTeam(team, user) {
  if (!team || !user) return false
  if (isAdmin(user.role)) return true
  if (user.role === ROLES.MANAGER && isTeamManager(team, user)) return true
  return false
}

export function canManageRoster(team, user) {
  if (!team || !user) return false
  if (isAdmin(user.role)) return true
  if (user.role === ROLES.MANAGER && isTeamManager(team, user)) return true
  if (user.role === ROLES.CAPTAIN && isTeamCaptain(team, user)) {
    return true
  }
  return false
}

export function canChangeTeamStatus(team, user) {
  if (!team || !user) return false
  if (isAdmin(user.role)) return true
  if (user.role === ROLES.MANAGER && isTeamManager(team, user)) return true
  return false
}

export function canArchiveTeam(user) {
  return isAdmin(user?.role)
}

export function canViewPayments(user) {
  return [ROLES.CAPTAIN, ROLES.MANAGER, ROLES.ADMIN].includes(user?.role)
}

export function canViewAvailabilityBoard(user) {
  return [ROLES.CAPTAIN, ROLES.MANAGER, ROLES.ADMIN].includes(user?.role)
}

export function isMyTeam(team, user, players = []) {
  if (!team || !user) return false
  if (isAdmin(user.role) || isOrganizer(user.role)) return true
  return (
    isTeamCaptain(team, user) ||
    isTeamManager(team, user) ||
    isOnRoster(players, team.id, user.name)
  )
}

export function getVisibleTeams(teams, players, user) {
  if (!user) return []
  if (isAdmin(user.role) || isOrganizer(user.role)) return teams

  if (isPlayer(user.role)) {
    const ids = new Set(
      players.filter((player) => player.name === user.name && player.teamId).map((player) => player.teamId),
    )
    return teams.filter((team) => ids.has(team.id))
  }

  if (user.role === ROLES.MANAGER) {
    return teams.filter((team) => isTeamManager(team, user))
  }

  if (user.role === ROLES.CAPTAIN) {
    return teams.filter(
      (team) =>
        isTeamCaptain(team, user) || isOnRoster(players, team.id, user.name),
    )
  }

  return teams
}
