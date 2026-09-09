import { ROLES, TOURNAMENT_WIP } from './constants'
import { withoutTournamentNav } from './tournamentWip'

const dashboard = { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }
const settings = { to: '/settings', label: 'Settings', icon: 'settings' }
const grounds = { to: '/grounds', label: 'Grounds', icon: 'grounds' }
const activity = { to: '/activity', label: 'Activity', icon: 'activity' }
const reports = { to: '/reports', label: 'Reports', icon: 'reports' }

const PAGE_DESCRIPTIONS = {
  '/dashboard': TOURNAMENT_WIP
    ? 'Overview of your cricket teams, matches, and finances.'
    : 'Overview of your cricket teams, matches, tournaments, and finances.',
  '/teams': 'Manage your cricket teams and team rosters.',
  '/teams/new': 'Add a new cricket team and start building the squad.',
  '/players': 'Manage cricket players, profiles, and team memberships.',
  '/players/new': 'Add a new player and assign them to a team.',
  '/matches': 'Manage upcoming, live, and completed cricket matches.',
  '/matches/new': 'Create a standalone cricket match and manage the fixture details.',
  '/tournaments': 'Discover and manage cricket tournaments.',
  '/tournaments/new': 'Create a cricket tournament and open team registration.',
  '/grounds': 'Find, manage, and schedule cricket grounds.',
  '/grounds/new': 'Add a cricket ground and venue details.',
  '/finance': 'Track payments, expenses, and financial activity.',
  '/finance/payments': 'Review payment records, pending contributions, and payment status.',
  '/finance/expenses': 'Track match, team, and tournament expenses.',
  '/finance/ledger': 'View the chronological financial ledger and running balance.',
  '/notifications': TOURNAMENT_WIP
    ? 'Stay updated with your teams, matches, and payments.'
    : 'Stay updated with your teams, matches, tournaments, and payments.',
  '/notifications/preferences': 'Choose which alerts you want to receive.',
  '/activity': 'Track recent activity across MyInnings.',
  '/admin': 'Manage users, teams, tournaments, and platform activities.',
  '/settings': 'Manage your application and account settings.',
  '/fixtures': 'View and manage upcoming tournament fixtures.',
  '/availability': 'Respond to match availability requests.',
  '/payments': 'Track your match fees and outstanding payments.',
  '/users': 'Review and manage platform users.',
  '/reports': 'Analyze performance, activity, finances, and growth across MyInnings.',
  '/reports/matches': 'Review match volume, results, and trends.',
  '/reports/teams': 'Compare team performance and squad participation.',
  '/reports/players': 'Track availability, selection, and player participation.',
  '/reports/tournaments': 'Measure tournament progress and team standings.',
  '/reports/finance': 'Analyze collections, expenses, and payment status.',
  '/reports/grounds': 'Review venue usage and booking activity.',
}

function withNotifications() {
  return {
    to: '/notifications',
    label: 'Notifications',
    icon: 'notifications',
    badge: 0,
  }
}

function finishNav(nav) {
  return {
    ...nav,
    main: withoutTournamentNav(nav.main),
    admin: withoutTournamentNav(nav.admin),
  }
}

export function getNavigation(role) {
  const notifications = withNotifications(role)

  if (role === ROLES.ORGANIZER) {
    return finishNav({
      main: [
        dashboard,
        { to: '/tournaments', label: 'Tournaments', icon: 'tournaments' },
        { to: '/teams', label: 'Teams', icon: 'teams' },
        { to: '/players', label: 'Players', icon: 'players' },
        { to: '/matches', label: 'Matches', icon: 'matches' },
        { to: '/fixtures', label: 'Fixtures', icon: 'clock' },
        grounds,
        { to: '/finance', label: 'Finance', icon: 'finance' },
        reports,
        notifications,
        activity,
        settings,
      ],
      admin: [],
    })
  }

  if (role === ROLES.PLAYER) {
    return finishNav({
      main: [
        dashboard,
        { to: '/teams', label: 'My Team', icon: 'teams' },
        { to: '/players', label: 'My Profile', icon: 'players' },
        { to: '/matches', label: 'My Matches', icon: 'matches' },
        { to: '/tournaments', label: 'Tournaments', icon: 'tournaments' },
        { to: '/availability', label: 'Availability', icon: 'clipboard' },
        grounds,
        { to: '/finance', label: 'Payments', icon: 'finance' },
        reports,
        notifications,
        activity,
        settings,
      ],
      admin: [],
    })
  }

  if (role === ROLES.ADMIN) {
    return finishNav({
      main: [
        dashboard,
        { to: '/teams', label: 'Teams', icon: 'teams' },
        { to: '/players', label: 'Players', icon: 'players' },
        { to: '/matches', label: 'Matches', icon: 'matches' },
        { to: '/tournaments', label: 'Tournaments', icon: 'tournaments' },
        grounds,
        { to: '/finance', label: 'Finance', icon: 'finance' },
        reports,
        notifications,
        activity,
        settings,
      ],
      admin: [
        { to: '/admin', label: 'Admin Dashboard', icon: 'admin' },
        { to: '/users', label: 'User Management', icon: 'user' },
        settings,
      ],
    })
  }

  return finishNav({
    main: [
      dashboard,
      { to: '/teams', label: 'My Teams', icon: 'teams' },
      { to: '/players', label: 'Players', icon: 'players' },
      { to: '/matches', label: 'Matches', icon: 'matches' },
      { to: '/tournaments', label: 'Tournaments', icon: 'tournaments' },
      grounds,
      { to: '/finance', label: 'Finance', icon: 'finance' },
      reports,
      notifications,
      activity,
      settings,
    ],
    admin: [],
  })
}

export function getPageMeta(pathname, role) {
  if (pathname === '/teams/new' || pathname === '/teams/create') {
    return {
      title: 'Create Team',
      description: PAGE_DESCRIPTIONS['/teams/new'],
    }
  }
  if (/^\/teams\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit Team',
      description: 'Update team details, status, and squad information.',
    }
  }
  if (/^\/teams\/[^/]+$/.test(pathname)) {
    return {
      title: 'Team Details',
      description: 'View team information, roster, matches, and statistics.',
    }
  }

  if (pathname === '/players/new' || pathname === '/players/create') {
    return {
      title: 'Add Player',
      description: PAGE_DESCRIPTIONS['/players/new'],
    }
  }
  if (/^\/players\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit Player',
      description: 'Update player profile details and cricket information.',
    }
  }
  if (/^\/players\/[^/]+$/.test(pathname)) {
    return {
      title: 'Player Profile',
      description: 'View player information, teams, matches, and statistics.',
    }
  }

  if (pathname === '/matches/new' || pathname === '/matches/create') {
    return {
      title: 'Create Match',
      description: PAGE_DESCRIPTIONS['/matches/new'],
    }
  }
  if (/^\/matches\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit Match',
      description: 'Update match details, timing, and venue.',
    }
  }
  if (/^\/matches\/[^/]+$/.test(pathname)) {
    return {
      title: 'Match Details',
      description: 'View squad, availability, costs, and match result.',
    }
  }

  if (pathname === '/tournaments/new' || pathname === '/tournaments/create') {
    return {
      title: 'Create Tournament',
      description: PAGE_DESCRIPTIONS['/tournaments/new'],
    }
  }
  if (/^\/tournaments\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit Tournament',
      description: 'Update tournament details, format, and schedule.',
    }
  }
  if (/^\/tournaments\/[^/]+$/.test(pathname)) {
    return {
      title: 'Tournament Details',
      description: 'View registrations, fixtures, standings, and results.',
    }
  }

  if (pathname === '/notifications/preferences') {
    return {
      title: 'Notification Preferences',
      description: PAGE_DESCRIPTIONS['/notifications/preferences'],
    }
  }
  if (pathname === '/activity') {
    return {
      title: 'Activity',
      description: PAGE_DESCRIPTIONS['/activity'],
    }
  }

  if (pathname === '/search') {
    return {
      title: 'Search',
      description: TOURNAMENT_WIP
        ? 'Find teams, players, matches, and grounds.'
        : 'Find teams, players, matches, tournaments, and grounds.',
    }
  }

  if (pathname === '/reports') {
    return {
      title: 'Reports & Statistics',
      description: PAGE_DESCRIPTIONS['/reports'],
    }
  }
  if (pathname.startsWith('/reports/')) {
    const titles = {
      '/reports/matches': 'Match Reports',
      '/reports/teams': 'Team Reports',
      '/reports/players': 'Player Reports',
      '/reports/tournaments': 'Tournament Reports',
      '/reports/finance': 'Finance Reports',
      '/reports/grounds': 'Ground Reports',
    }
    return {
      title: titles[pathname] || 'Reports & Statistics',
      description: PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/reports'],
    }
  }

  if (pathname === '/grounds') {
    return {
      title: 'Grounds & Venues',
      description: PAGE_DESCRIPTIONS['/grounds'],
    }
  }
  if (pathname === '/grounds/new' || pathname === '/grounds/create') {
    return {
      title: 'Add Ground',
      description: PAGE_DESCRIPTIONS['/grounds/new'],
    }
  }
  if (/^\/grounds\/[^/]+\/edit$/.test(pathname)) {
    return {
      title: 'Edit Ground',
      description: 'Update venue details, facilities, and opening hours.',
    }
  }
  if (/^\/grounds\/[^/]+$/.test(pathname)) {
    return {
      title: 'Ground Details',
      description: 'View venue information, schedule, and bookings.',
    }
  }

  if (pathname.startsWith('/finance')) {
    if (role === ROLES.PLAYER) {
      return {
        title: 'My Payments',
        description: 'View your pending contributions and payment history.',
      }
    }
    const titles = {
      '/finance': 'Finance',
      '/finance/payments': 'Payments',
      '/finance/expenses': 'Expenses',
      '/finance/ledger': 'Ledger',
    }
    const title = Object.entries(titles).find(([path]) => pathname === path)?.[1]
      || (pathname.startsWith('/finance/payments/') ? 'Payment Details' : 'Finance')
    return {
      title,
      description: PAGE_DESCRIPTIONS[pathname] || PAGE_DESCRIPTIONS['/finance'],
    }
  }

  const { main, admin } = getNavigation(role)
  const match = [...main, ...admin].find((item) => item.to === pathname)

  return {
    title: match?.label ?? 'MyInnings',
    description: PAGE_DESCRIPTIONS[pathname] ?? 'Cricket management platform',
  }
}
