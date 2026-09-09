import { TOURNAMENT_WIP } from './constants'

export function isTournamentNotification(item) {
  if (!item) return false
  const route = String(item.route || '')
  const type = String(item.type || '')
  const message = `${item.title || ''} ${item.message || ''}`
  return (
    item.category === 'Tournament' ||
    item.relatedEntityType === 'tournament' ||
    type.includes('tournament') ||
    route.startsWith('/tournaments') ||
    route.startsWith('/fixtures') ||
    /tournament/i.test(message)
  )
}

export function isTournamentActivity(item) {
  if (!item) return false
  const route = String(item.route || '')
  const text = `${item.title || ''} ${item.description || ''} ${item.text || ''}`
  return (
    item.category === 'Tournament Activity' ||
    item.relatedEntityType === 'tournament' ||
    route.startsWith('/tournaments') ||
    route.startsWith('/fixtures') ||
    /tournament/i.test(text)
  )
}

export function withoutTournamentNav(items = []) {
  if (!TOURNAMENT_WIP) return items
  return items.filter((item) => item.to !== '/fixtures')
}

export function withoutTournamentActions(actions = []) {
  if (!TOURNAMENT_WIP) return actions
  return actions.filter((action) => {
    const to = String(action.to || '')
    const label = String(action.label || '')
    return !to.startsWith('/tournaments') && !to.startsWith('/fixtures') && !/tournament/i.test(label)
  })
}

export function withoutTournamentStats(stats = []) {
  if (!TOURNAMENT_WIP) return stats
  return stats.filter(
    (stat) => stat.id !== 'tournaments' && stat.id !== 'approvals' && !/tournament/i.test(stat.label || ''),
  )
}
