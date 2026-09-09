import { AUTH_STORAGE_KEYS, ROLES } from './constants'
import { loadUsers, readJson } from './storage'

const notifyListeners = new Set()
const activityListeners = new Set()

export const DEFAULT_PREFERENCES = {
  matchCreated: true,
  matchUpdates: true,
  squadUpdates: true,
  registrationUpdates: true,
  fixtureUpdates: true,
  results: true,
  paymentReminders: true,
  paymentConfirmations: true,
  bookingConfirmations: true,
  bookingReminders: true,
  systemUpdates: true,
}

export const PREFERENCE_META = [
  {
    group: 'Match notifications',
    items: [
      { key: 'matchCreated', label: 'Match created' },
      { key: 'matchUpdates', label: 'Match updates' },
      { key: 'squadUpdates', label: 'Squad updates' },
    ],
  },
  {
    group: 'Tournament notifications',
    items: [
      { key: 'registrationUpdates', label: 'Registration updates' },
      { key: 'fixtureUpdates', label: 'Fixture updates' },
      { key: 'results', label: 'Results' },
    ],
  },
  {
    group: 'Finance notifications',
    items: [
      { key: 'paymentReminders', label: 'Payment reminders' },
      { key: 'paymentConfirmations', label: 'Payment confirmations' },
    ],
  },
  {
    group: 'Ground notifications',
    items: [
      { key: 'bookingConfirmations', label: 'Booking confirmations' },
      { key: 'bookingReminders', label: 'Booking reminders' },
    ],
  },
  {
    group: 'System notifications',
    items: [{ key: 'systemUpdates', label: 'Important updates' }],
  },
]

export function emitNotification(payload) {
  notifyListeners.forEach((listener) => listener(payload))
}

export function emitActivity(payload) {
  activityListeners.forEach((listener) => listener(payload))
}

export function onNotification(listener) {
  notifyListeners.add(listener)
  return () => notifyListeners.delete(listener)
}

export function onActivity(listener) {
  activityListeners.add(listener)
  return () => activityListeners.delete(listener)
}

export function loadPreferences(userId) {
  if (!userId) return { ...DEFAULT_PREFERENCES }
  const stored = readJson(AUTH_STORAGE_KEYS.notificationPrefs, {})
  return { ...DEFAULT_PREFERENCES, ...(stored[userId] || {}) }
}

export function preferenceAllows(userId, key) {
  if (!key) return true
  const prefs = loadPreferences(userId)
  return prefs[key] !== false
}

export function resolveRecipientIds(payload, teams = [], players = []) {
  const users = loadUsers()
  const ids = new Set(payload.userIds || [])

  if (payload.playerIds?.length) {
    const names = players.filter((player) => payload.playerIds.includes(player.id)).map((player) => player.name)
    users.filter((user) => names.includes(user.name)).forEach((user) => ids.add(user.id))
  }

  if (payload.teamIds?.length) {
    payload.teamIds.forEach((teamId) => {
      const team = teams.find((item) => item.id === teamId)
      if (!team) return
      const names = []
      const staffRoles = payload.staffRoles || ['captain', 'manager']
      if (staffRoles.includes('captain')) {
        names.push(team.captain, ...(team.assignedCaptains || []))
      }
      if (staffRoles.includes('manager')) names.push(team.manager)
      if (payload.includeRoster) {
        players.filter((player) => player.teamId === teamId).forEach((player) => names.push(player.name))
      }
      users.filter((user) => names.filter(Boolean).includes(user.name)).forEach((user) => ids.add(user.id))
    })
  }

  if (payload.roles?.length) {
    users.filter((user) => payload.roles.includes(user.role)).forEach((user) => ids.add(user.id))
  }

  if (payload.includeAdmin) {
    users.filter((user) => user.role === ROLES.ADMIN).forEach((user) => ids.add(user.id))
  }

  if (payload.organizerId) ids.add(payload.organizerId)
  if (payload.organizerName) {
    users.filter((user) => user.name === payload.organizerName).forEach((user) => ids.add(user.id))
  }

  if (payload.currentUserId) ids.add(payload.currentUserId)

  return [...ids]
}

export function typeToPreference(type = '', category = '') {
  const map = {
    'match-created': 'matchCreated',
    'match-updated': 'matchUpdates',
    'match-result': 'matchUpdates',
    'availability': 'matchUpdates',
    'squad-finalized': 'squadUpdates',
    'player-replaced': 'squadUpdates',
    'tournament-created': 'registrationUpdates',
    'registration-submitted': 'registrationUpdates',
    'registration-approved': 'registrationUpdates',
    'registration-rejected': 'registrationUpdates',
    fixtures: 'fixtureUpdates',
    'tournament-started': 'fixtureUpdates',
    knockout: 'results',
    'tournament-complete': 'results',
    'payment-created': 'paymentReminders',
    'payment-reminder': 'paymentReminders',
    'payment-received': 'paymentConfirmations',
    'payment-overdue': 'paymentReminders',
    'expense-added': 'paymentConfirmations',
    'booking-created': 'bookingConfirmations',
    'booking-cancelled': 'bookingConfirmations',
    'booking-conflict': 'bookingConfirmations',
    'booking-reminder': 'bookingReminders',
    system: 'systemUpdates',
  }
  if (map[type]) return map[type]
  if (category === 'Match' || category === 'Player') return 'matchUpdates'
  if (category === 'Tournament') return 'registrationUpdates'
  if (category === 'Finance' || category === 'Payment') return 'paymentReminders'
  if (category === 'Ground' || category === 'Booking') return 'bookingConfirmations'
  return 'systemUpdates'
}
