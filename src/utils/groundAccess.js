import { ROLES, TOURNAMENT_WIP } from './constants'
import { isAdmin, isOrganizer, isPlayer } from './teamAccess'

export function canViewGrounds() {
  return true
}

export function canCreateGround(role) {
  return role === ROLES.ADMIN
}

export function canEditGround(user) {
  return isAdmin(user?.role)
}

export function canDeleteGround(user) {
  return isAdmin(user?.role)
}

export function canCheckAvailability(role) {
  return [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER].includes(role)
}

export function canCreateBooking(role) {
  return [ROLES.ADMIN, ROLES.MANAGER, ROLES.CAPTAIN, ROLES.ORGANIZER].includes(role)
}

export function allowedBookingTypes(role) {
  const types =
    role === ROLES.ORGANIZER
      ? ['Tournament', 'Other']
      : role === ROLES.ADMIN
        ? ['Match', 'Tournament', 'Practice', 'Other']
        : role === ROLES.MANAGER || role === ROLES.CAPTAIN
          ? ['Match', 'Practice', 'Other']
          : []
  return TOURNAMENT_WIP ? types.filter((item) => item !== 'Tournament') : types
}

export function canCancelBooking(booking, user) {
  if (!booking || !user) return false
  if (booking.status !== 'Upcoming') return false
  if (isPlayer(user.role)) return false
  if (isAdmin(user.role)) return true
  if (isOrganizer(user.role)) {
    return Boolean(booking.tournamentId) || booking.type === 'Tournament'
  }
  if (user.role === ROLES.MANAGER || user.role === ROLES.CAPTAIN) {
    return booking.type !== 'Tournament' || booking.createdBy === user.name
  }
  return false
}

export function canAssignTournamentGrounds(user) {
  return isAdmin(user?.role) || isOrganizer(user?.role)
}
