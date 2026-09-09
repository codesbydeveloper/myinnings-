export const NOTIFICATION_CATEGORIES = [
  { id: 'Match', icon: 'matches', emoji: '🏏' },
  { id: 'Team', icon: 'teams', emoji: '👥' },
  { id: 'Player', icon: 'players', emoji: '🧑' },
  { id: 'Tournament', icon: 'tournaments', emoji: '🏆' },
  { id: 'Finance', icon: 'finance', emoji: '₹' },
  { id: 'Payment', icon: 'finance', emoji: '₹' },
  { id: 'Ground', icon: 'grounds', emoji: '📍' },
  { id: 'Booking', icon: 'grounds', emoji: '📅' },
  { id: 'System', icon: 'settings', emoji: '⚙️' },
]

export const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'Match', label: 'Match' },
  { id: 'Tournament', label: 'Tournament' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Ground', label: 'Ground' },
  { id: 'System', label: 'System' },
]

export function categoryMeta(category) {
  return NOTIFICATION_CATEGORIES.find((item) => item.id === category) || NOTIFICATION_CATEGORIES[8]
}

export function formatRelativeTime(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 45 * 1000) return 'Just now'
  const minutes = Math.round(diff / 60000)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  const hours = Math.round(diff / 3600000)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const startNow = new Date(now)
  startNow.setHours(0, 0, 0, 0)
  const startThen = new Date(date)
  startThen.setHours(0, 0, 0, 0)
  const days = Math.round((startNow - startThen) / 86400000)
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function matchesNotificationFilter(item, filter) {
  if (!filter || filter === 'all') return true
  if (filter === 'unread') return !item.isRead
  if (filter === 'Finance') return item.category === 'Finance' || item.category === 'Payment'
  if (filter === 'Ground') return item.category === 'Ground' || item.category === 'Booking'
  return item.category === filter
}

function ago(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

export function decorateNotification(item = {}) {
  const meta = categoryMeta(item.category)
  return {
    type: item.type || 'system',
    category: item.category || 'System',
    role: item.role || '',
    relatedEntityType: item.relatedEntityType || '',
    relatedEntityId: item.relatedEntityId || null,
    route: item.route || '/notifications',
    isRead: Boolean(item.isRead),
    icon: item.icon || meta.icon,
    emoji: item.emoji || meta.emoji,
    actorName: item.actorName || '',
    teamId: item.teamId || null,
    ...item,
  }
}

export const SEED_NOTIFICATIONS = [
  decorateNotification({
    id: 'note-player-match',
    userId: 'user-004',
    role: 'Player',
    title: 'Upcoming match reminder',
    message: 'Confirm your availability for Mumbai Warriors vs Delhi Strikers on 15 September.',
    type: 'match-created',
    category: 'Match',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    isRead: false,
    createdAt: ago(15),
  }),
  decorateNotification({
    id: 'note-player-pay',
    userId: 'user-004',
    role: 'Player',
    title: 'Payment Pending',
    message: 'You have a pending match contribution of ₹750 for Mumbai Warriors vs Delhi Strikers.',
    type: 'payment-reminder',
    category: 'Payment',
    relatedEntityType: 'payment',
    relatedEntityId: 'pay-1021',
    route: '/finance/payments/pay-1021',
    isRead: false,
    createdAt: ago(80),
  }),
  decorateNotification({
    id: 'note-player-squad',
    userId: 'user-004',
    role: 'Player',
    title: 'Squad named',
    message: 'You are in the playing XI for Mumbai Warriors vs Pune Panthers.',
    type: 'squad-finalized',
    category: 'Match',
    relatedEntityType: 'match',
    relatedEntityId: 'match-003',
    route: '/matches/match-003',
    isRead: true,
    createdAt: ago(60 * 36),
  }),
  decorateNotification({
    id: 'note-manager-avail',
    userId: 'user-003',
    role: 'Team Manager',
    title: 'Player availability update',
    message: 'Arjun Singh marked himself as available for Mumbai Warriors vs Delhi Strikers.',
    type: 'availability',
    category: 'Player',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    isRead: false,
    createdAt: ago(12),
    actorName: 'Arjun Singh',
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-manager-match',
    userId: 'user-003',
    role: 'Team Manager',
    title: 'New Match Created',
    message: 'Mumbai Warriors vs Delhi Strikers has been created.',
    type: 'match-created',
    category: 'Match',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    isRead: false,
    createdAt: ago(28),
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-manager-book',
    userId: 'user-003',
    role: 'Team Manager',
    title: 'Ground Booking Confirmed',
    message: 'Wankhede Practice Ground has been booked for Mumbai Warriors vs Delhi Strikers.',
    type: 'booking-created',
    category: 'Booking',
    relatedEntityType: 'ground',
    relatedEntityId: 'ground-001',
    route: '/grounds/ground-001',
    isRead: true,
    createdAt: ago(60 * 26),
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-captain-squad',
    userId: 'user-001',
    role: 'Team Captain',
    title: 'Squad selection is pending',
    message: 'Finalise the XI for Mumbai Warriors vs Delhi Strikers.',
    type: 'match-updated',
    category: 'Match',
    relatedEntityType: 'match',
    relatedEntityId: 'match-001',
    route: '/matches/match-001',
    isRead: false,
    createdAt: ago(18),
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-captain-pay',
    userId: 'user-001',
    role: 'Team Captain',
    title: 'Payment updates',
    message: 'Three Mumbai Warriors players still have pending match contributions.',
    type: 'payment-reminder',
    category: 'Finance',
    relatedEntityType: 'payment',
    relatedEntityId: 'pay-1021',
    route: '/finance/payments',
    isRead: false,
    createdAt: ago(110),
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-captain-ground',
    userId: 'user-001',
    role: 'Team Captain',
    title: 'Ground confirmed',
    message: 'Wankhede Practice Ground is booked for 10:00 AM on 15 September.',
    type: 'booking-created',
    category: 'Ground',
    relatedEntityType: 'ground',
    relatedEntityId: 'ground-001',
    route: '/grounds/ground-001',
    isRead: true,
    createdAt: ago(60 * 48),
  }),
  decorateNotification({
    id: 'note-captain-approved',
    userId: 'user-001',
    role: 'Team Captain',
    title: 'Team Registration Approved',
    message: 'Your team has been approved for MyInnings Premier League 2026.',
    type: 'registration-approved',
    category: 'Tournament',
    relatedEntityType: 'tournament',
    relatedEntityId: 'tournament-001',
    route: '/tournaments/tournament-001',
    isRead: true,
    createdAt: ago(60 * 72),
    teamId: 'team-001',
  }),
  decorateNotification({
    id: 'note-org-reg',
    userId: 'user-002',
    role: 'Tournament Organizer',
    title: 'Team registration request',
    message: 'Pune Panthers requested to join MyInnings Premier League 2026.',
    type: 'registration-submitted',
    category: 'Tournament',
    relatedEntityType: 'tournament',
    relatedEntityId: 'tournament-001',
    route: '/tournaments/tournament-001?tab=teams',
    isRead: false,
    createdAt: ago(8),
    teamId: 'team-005',
  }),
  decorateNotification({
    id: 'note-org-fix',
    userId: 'user-002',
    role: 'Tournament Organizer',
    title: 'Fixture updates',
    message: 'Corporate Cup 2026 league fixtures are ready to review.',
    type: 'fixtures',
    category: 'Tournament',
    relatedEntityType: 'tournament',
    relatedEntityId: 'tournament-002',
    route: '/tournaments/tournament-002?tab=fixtures',
    isRead: true,
    createdAt: ago(60 * 30),
  }),
  decorateNotification({
    id: 'note-admin-platform',
    userId: 'user-005',
    role: 'Platform Admin',
    title: 'Platform activity',
    message: 'New club activity this week: 3 tournaments, 8 scheduled matches, and 12 user registrations.',
    type: 'system',
    category: 'System',
    relatedEntityType: 'system',
    relatedEntityId: null,
    route: '/admin',
    isRead: false,
    createdAt: ago(10),
  }),
  decorateNotification({
    id: 'note-admin-tourney',
    userId: 'user-005',
    role: 'Platform Admin',
    title: 'Tournament created',
    message: 'MyInnings Premier League 2026 is open for team registration.',
    type: 'tournament-created',
    category: 'Tournament',
    relatedEntityType: 'tournament',
    relatedEntityId: 'tournament-001',
    route: '/tournaments/tournament-001',
    isRead: false,
    createdAt: ago(95),
  }),
  decorateNotification({
    id: 'note-manager-arena',
    userId: 'user-003',
    role: 'Team Manager',
    title: 'Upcoming booking reminder',
    message: 'Mumbai Cricket Arena is reserved tomorrow for practice nets.',
    type: 'booking-reminder',
    category: 'Ground',
    relatedEntityType: 'ground',
    relatedEntityId: 'ground-008',
    route: '/grounds/ground-008',
    isRead: false,
    createdAt: ago(40),
  }),
]
