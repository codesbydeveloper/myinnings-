import { AUTH_STORAGE_KEYS } from './constants'

export const DEMO_RESET_KEYS = [
  AUTH_STORAGE_KEYS.availability,
  AUTH_STORAGE_KEYS.registrations,
  AUTH_STORAGE_KEYS.teamStore,
  AUTH_STORAGE_KEYS.matchStore,
  AUTH_STORAGE_KEYS.tournamentStore,
  AUTH_STORAGE_KEYS.financeStore,
  AUTH_STORAGE_KEYS.groundStore,
  AUTH_STORAGE_KEYS.notificationStore,
  AUTH_STORAGE_KEYS.activityStore,
  AUTH_STORAGE_KEYS.notificationPrefs,
]

export function resetDemoData() {
  DEMO_RESET_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  })
  try {
    window.sessionStorage.removeItem('myinnings.reportRange')
  } catch {
    /* ignore */
  }
}
