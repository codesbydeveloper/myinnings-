export const AUTH_STORAGE_KEYS = {
  session: 'myinnings.session',
  users: 'myinnings.users',
  rememberEmail: 'myinnings.rememberEmail',
  availability: 'myinnings.availability',
  registrations: 'myinnings.registrations',
  teamStore: 'myinnings.teamStore',
  matchStore: 'myinnings.matchStore',
  tournamentStore: 'myinnings.tournamentStore',
  financeStore: 'myinnings.financeStore',
  groundStore: 'myinnings.groundStore',
  notificationStore: 'myinnings.notificationStore',
  activityStore: 'myinnings.activityStore',
  notificationPrefs: 'myinnings.notificationPrefs',
}

export const DEMO_PASSWORD = 'Demo123!'

export const PLATFORM_ADMIN_ROLE = 'Platform Admin'

export const ROLES = {
  CAPTAIN: 'Team Captain',
  MANAGER: 'Team Manager',
  ORGANIZER: 'Tournament Organizer',
  PLAYER: 'Player',
  ADMIN: PLATFORM_ADMIN_ROLE,
}

export const REGISTER_ROLES = [
  'Team Captain',
  'Team Manager',
  'Tournament Organizer',
  'Player',
]

export const DEMO_USERS = [
  {
    id: 'user-001',
    name: 'Rahul Sharma',
    email: 'captain@myinnings.demo',
    role: 'Team Captain',
    avatar: null,
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-002',
    name: 'Priya Patel',
    email: 'organizer@myinnings.demo',
    role: 'Tournament Organizer',
    avatar: null,
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-003',
    name: 'Amit Kumar',
    email: 'manager@myinnings.demo',
    role: 'Team Manager',
    avatar: null,
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-004',
    name: 'Arjun Singh',
    email: 'player@myinnings.demo',
    role: 'Player',
    avatar: null,
    password: DEMO_PASSWORD,
  },
  {
    id: 'user-005',
    name: 'Vikram Mehta',
    email: 'admin@myinnings.demo',
    role: 'Platform Admin',
    avatar: null,
    password: DEMO_PASSWORD,
  },
]

export const NOTIFICATION_COUNT = 3

export const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/teams', label: 'Teams', icon: 'teams' },
  { to: '/players', label: 'Players', icon: 'players' },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/tournaments', label: 'Tournaments', icon: 'tournaments' },
  { to: '/grounds', label: 'Grounds', icon: 'grounds' },
  { to: '/finance', label: 'Finance', icon: 'finance' },
  { to: '/reports', label: 'Reports', icon: 'reports' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/activity', label: 'Activity', icon: 'clipboard' },
]

export const ADMIN_NAV = [
  { to: '/admin', label: 'Admin Dashboard', icon: 'admin' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export const PAGE_META = {
  '/dashboard': {
    title: 'Dashboard',
    description:
      'Overview of your cricket teams, matches, tournaments, and finances.',
  },
  '/teams': {
    title: 'Teams',
    description: 'Manage your cricket teams and team rosters.',
  },
  '/players': {
    title: 'Players',
    description: 'Manage cricket players, profiles, and team memberships.',
  },
  '/matches': {
    title: 'Matches',
    description: 'Manage upcoming, live, and completed cricket matches.',
  },
  '/tournaments': {
    title: 'Tournaments',
    description: 'Discover and manage cricket tournaments.',
  },
  '/finance': {
    title: 'Finance',
    description: 'Track payments, expenses, and financial activity.',
  },
  '/grounds': {
    title: 'Grounds & Venues',
    description: 'Find, manage, and schedule cricket grounds.',
  },
  '/notifications': {
    title: 'Notifications',
    description: 'Stay updated with your teams, matches, tournaments, and payments.',
  },
  '/activity': {
    title: 'Activity',
    description: 'Track recent activity across MyInnings.',
  },
  '/reports': {
    title: 'Reports & Statistics',
    description: 'Analyze performance, activity, finances, and growth across MyInnings.',
  },
  '/admin': {
    title: 'Admin Dashboard',
    description: 'Manage users, teams, tournaments, and platform activities.',
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage your application and account settings.',
  },
}

export const DASHBOARD_STATS = [
  { id: 'teams', label: 'Total Teams', value: '5', icon: 'teams' },
  { id: 'players', label: 'Total Players', value: '72', icon: 'players' },
  { id: 'matches', label: 'Upcoming Matches', value: '3', icon: 'matches' },
  {
    id: 'payments',
    label: 'Pending Payments',
    value: '₹4,500',
    icon: 'finance',
  },
]

export function getPageMeta(pathname) {
  return (
    PAGE_META[pathname] ?? {
      title: 'MyInnings',
      description: 'Cricket management platform',
    }
  )
}

export function isPlatformAdmin(role) {
  return role === PLATFORM_ADMIN_ROLE
}

export function getAdminNav(role) {
  if (isPlatformAdmin(role)) return ADMIN_NAV
  return ADMIN_NAV.filter((item) => item.to !== '/admin')
}
