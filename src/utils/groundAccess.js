import { ROLES } from './constants'
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
  if (role === ROLES.ORGANIZER) return ['Tournament', 'Other']
  if (role === ROLES.ADMIN) return ['Match', 'Tournament', 'Practice', 'Other']
  if (role === ROLES.MANAGER || role === ROLES.CAPTAIN) return ['Match', 'Practice', 'Other']
  return []
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
