import { AUTH_STORAGE_KEYS, DEMO_USERS } from '../utils/constants'
import { toSessionUser } from '../utils/helpers'

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function loadUsers() {
  const stored = readJson(AUTH_STORAGE_KEYS.users, [])
  const byEmail = new Map(
    stored.map((user) => [String(user.email).toLowerCase(), user]),
  )

  DEMO_USERS.forEach((demoUser) => {
    if (!byEmail.has(demoUser.email.toLowerCase())) {
      byEmail.set(demoUser.email.toLowerCase(), demoUser)
    }
  })

  const users = Array.from(byEmail.values())
  writeJson(AUTH_STORAGE_KEYS.users, users)
  return users
}

export function saveUsers(users) {
  writeJson(AUTH_STORAGE_KEYS.users, users)
}

export function loadSession() {
  const session = readJson(AUTH_STORAGE_KEYS.session, null)
  if (!session?.id || !session?.email) return null
  return toSessionUser(session)
}

export function saveSession(user) {
  writeJson(AUTH_STORAGE_KEYS.session, toSessionUser(user))
}

export function clearSession() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.session)
  } catch {
    /* ignore */
  }
}

export function loadRememberedEmail() {
  try {
    return window.localStorage.getItem(AUTH_STORAGE_KEYS.rememberEmail) || ''
  } catch {
    return ''
  }
}

export function saveRememberedEmail(email) {
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEYS.rememberEmail, email)
  } catch {
    /* ignore */
  }
}

export function clearRememberedEmail() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.rememberEmail)
  } catch {
    /* ignore */
  }
}
