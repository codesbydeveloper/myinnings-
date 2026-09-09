import { formatRelativeTime } from './notificationModel'

export const ACTIVITY_CATEGORIES = [
  { id: 'Match Activity', icon: 'matches', filter: 'Matches' },
  { id: 'Team Activity', icon: 'teams', filter: 'Teams' },
  { id: 'Player Activity', icon: 'players', filter: 'Players' },
  { id: 'Tournament Activity', icon: 'tournaments', filter: 'Tournaments' },
  { id: 'Finance Activity', icon: 'finance', filter: 'Finance' },
  { id: 'Ground Activity', icon: 'grounds', filter: 'Grounds' },
  { id: 'System Activity', icon: 'settings', filter: 'System' },
]

export const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Matches', label: 'Matches' },
  { id: 'Teams', label: 'Teams' },
  { id: 'Players', label: 'Players' },
  { id: 'Tournaments', label: 'Tournaments' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Grounds', label: 'Grounds' },
]

export function activityIcon(category) {
  return ACTIVITY_CATEGORIES.find((item) => item.id === category)?.icon || 'clipboard'
}

export function matchesActivityFilter(item, filter) {
  if (!filter || filter === 'all') return true
  const meta = ACTIVITY_CATEGORIES.find((entry) => entry.filter === filter)
  return meta ? item.category === meta.id : true
}

export { formatRelativeTime }

function ago(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

export function decorateActivity(item = {}) {
  return {
    category: item.category || 'System Activity',
    relatedEntityType: item.relatedEntityType || '',
    relatedEntityId: item.relatedEntityId || null,
    route: item.route || '/activity',
    actorName: item.actorName || '',
    actorId: item.actorId || null,
    teamId: item.teamId || null,
    teamIds: item.teamIds || (item.teamId ? [item.teamId] : []),
    icon: item.icon || activityIcon(item.category),
    ...item,
  }
}

export function isActivityVisible(item, user, teams = [], players = []) {
  if (!user) return false
  if (user.role === 'Platform Admin') return true
  if (item.actorId === user.id || item.actorName === user.name) return true
  if (item.userIds?.includes(user.id)) return true

  const linkedTeamIds = teams
    .filter(
      (team) =>
        team.manager === user.name ||
        team.captain === user.name ||
        team.assignedCaptains?.includes(user.name) ||
        players.some((player) => player.teamId === team.id && player.name === user.name),
    )
    .map((team) => team.id)

  const mentionsTeam =
    (item.teamId && linkedTeamIds.includes(item.teamId)) ||
    (item.teamIds || []).some((id) => linkedTeamIds.includes(id))

  if (user.role === 'Player') {
    return mentionsTeam || item.category === 'System Activity'
  }
  if (user.role === 'Tournament Organizer') {
    return (
      item.category === 'Tournament Activity' ||
      item.category === 'Ground Activity' ||
      item.category === 'System Activity' ||
      item.category === 'Finance Activity'
    )
  }
  if (mentionsTeam) return true
  return item.category === 'System Activity'
}

export const SEED_ACTIVITIES = [
  decorateActivity({
    id: 'act-seed-avail',
    title: 'Availability updated',
    description: 'Arjun Singh marked himself as available.',
    category: 'Player Activity',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    actorName: 'Arjun Singh',
    actorId: 'user-004',
    teamId: 'team-001',
    createdAt: ago(10),
  }),
  decorateActivity({
    id: 'act-seed-match',
    title: 'Match Created',
    description: 'Mumbai Warriors created a match against Delhi Strikers.',
    category: 'Match Activity',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    actorName: 'Amit Kumar',
    actorId: 'user-003',
    teamId: 'team-001',
    teamIds: ['team-001', 'team-002'],
    createdAt: ago(28),
  }),
  decorateActivity({
    id: 'act-seed-booking',
    title: 'Ground booking created',
    description: 'A new ground booking was created at Wankhede Practice Ground.',
    category: 'Ground Activity',
    relatedEntityType: 'ground',
    relatedEntityId: 'ground-001',
    route: '/grounds/ground-001',
    actorName: 'Amit Kumar',
    actorId: 'user-003',
    teamId: 'team-001',
    createdAt: ago(32),
  }),
  decorateActivity({
    id: 'act-seed-reg',
    title: 'Tournament registration',
    description: 'Pune Panthers registered for MyInnings Premier League 2026.',
    category: 'Tournament Activity',
    relatedEntityType: 'tournament',
    relatedEntityId: 'tournament-001',
    route: '/tournaments/tournament-001',
    actorName: 'Rahul Sharma',
    actorId: 'user-001',
    teamId: 'team-005',
    createdAt: ago(8),
  }),
  decorateActivity({
    id: 'act-seed-pay',
    title: 'Payment pending',
    description: 'A match contribution of ₹750 is pending for Arjun Singh.',
    category: 'Finance Activity',
    relatedEntityType: 'payment',
    relatedEntityId: 'pay-1021',
    route: '/finance/payments/pay-1021',
    actorName: 'Amit Kumar',
    actorId: 'user-003',
    teamId: 'team-001',
    userIds: ['user-004', 'user-003', 'user-001'],
    createdAt: ago(90),
  }),
  decorateActivity({
    id: 'act-seed-admin',
    title: 'Platform update',
    description: '12 new users registered on MyInnings this week.',
    category: 'System Activity',
    relatedEntityType: 'system',
    route: '/admin',
    actorName: 'Vikram Mehta',
    actorId: 'user-005',
    createdAt: ago(120),
  }),
]
