import { ROLES } from './constants'
import { getMatchableTeams } from './matchAccess'
import { isAdmin, isOrganizer, isPlayer } from './teamAccess'

export function canCreateTournament(role) {
  return role === ROLES.ORGANIZER || role === ROLES.ADMIN
}

export function canManageTournament(tournament, user) {
  if (!tournament || !user) return false
  if (isAdmin(user.role) || isOrganizer(user.role)) return true
  return false
}

export function canEditTournament(tournament, user) {
  return canManageTournament(tournament, user) && !['Completed', 'Cancelled'].includes(tournament.status)
}

export function canApproveRegistrations(tournament, user) {
  return canEditTournament(tournament, user)
}

export function canGenerateFixtures(tournament, user) {
  return canEditTournament(tournament, user)
}

export function canCompleteTournament(tournament, user) {
  return canManageTournament(tournament, user) && tournament.status !== 'Completed'
}

export function canRegisterForTournament(tournament, user) {
  if (!tournament || !user) return false
  if (isPlayer(user.role) || isOrganizer(user.role)) return false
  if (!['Registration Open'].includes(tournament.status)) return false
  return user.role === ROLES.CAPTAIN || user.role === ROLES.MANAGER || isAdmin(user.role)
}

export function getRegistrableTeams(teams, players, user, tournament) {
  if (!canRegisterForTournament(tournament, user) && !isAdmin(user?.role)) return []
  const taken = new Set(
    (tournament.registrations || [])
      .filter((item) => item.status !== 'Rejected')
      .map((item) => item.teamId),
  )
  return getMatchableTeams(teams, players, user).filter((team) => !taken.has(team.id))
}

export function registrationForTeam(tournament, teamId) {
  return (tournament.registrations || []).find((item) => item.teamId === teamId) || null
}

export function canViewTournament() {
  return true
}
