export function getFirstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there'
}

export function getTeamInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function formatDisplayDate(value) {
  if (!value) return ''
  const date =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDisplayTime(value) {
  if (!value) return ''
  const raw = String(value).trim()
  if (/am|pm/i.test(raw) && !raw.includes('T')) return raw
  const clock = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (clock) {
    const hours = Number(clock[1])
    const minutes = clock[2]
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const hour = ((hours + 11) % 12) + 1
    return `${hour}:${minutes} ${suffix}`
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export function isDateRangeValid(startKey, endKey) {
  if (!startKey || !endKey) return true
  return endKey >= startKey
}

export function formatDisplayDateTime(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${formatDisplayDate(date)}, ${formatDisplayTime(date)}`
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function daysUntil(dateKey) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${dateKey}T00:00:00`)
  const diff = Math.round((target - today) / 86400000)
  return diff
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'MI'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidMobile(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return true
  if (digits.length === 12 && digits.startsWith('91')) return true
  return false
}

export function isStrongPassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

export function simulateRequest(ms = 750) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function toSessionUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? null,
  }
}

export const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50'

export const fieldErrorClass =
  'w-full rounded-lg border border-red-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'

export const primaryButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60'

export function getFieldClass(error) {
  return error ? fieldErrorClass : fieldClass
}

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function getWinRate(stats) {
  if (!stats?.played) return 0
  return Math.round((stats.wins / stats.played) * 100)
}

export function opponentOf(match, teamName) {
  return match.home === teamName ? match.away : match.home
}

export function formatINR(amount = 0) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}
