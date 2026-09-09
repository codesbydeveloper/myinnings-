import { ROLES } from '../utils/constants'

export const ROLE_NOTIFICATIONS = {
  [ROLES.CAPTAIN]: [
    {
      id: 'n-c1',
      icon: 'clipboard',
      title: 'Squad selection is pending',
      description: 'Finalise the XI for Mumbai Warriors vs Delhi Strikers.',
      time: '12 min ago',
      unread: true,
    },
    {
      id: 'n-c2',
      icon: 'teams',
      title: 'Availability submitted',
      description: 'Mumbai Warriors have submitted availability for 15 September.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 'n-c3',
      icon: 'finance',
      title: 'Pending match fees',
      description: 'You have 3 pending player payments totalling ₹4,500.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 'n-c4',
      icon: 'matches',
      title: 'Ground confirmed',
      description: 'Wankhede Practice Ground is booked for 10:00 AM.',
      time: '2 days ago',
      unread: false,
    },
  ],
  [ROLES.MANAGER]: [
    {
      id: 'n-m1',
      icon: 'clipboard',
      title: 'Ground booking pending',
      description: 'Confirm the venue for 20 September before 6:00 PM.',
      time: '20 min ago',
      unread: true,
    },
    {
      id: 'n-m2',
      icon: 'players',
      title: 'Follow up required',
      description: '3 players still need kit collection confirmation.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 'n-m3',
      icon: 'finance',
      title: 'Collection reminder',
      description: 'Match payment for Mumbai Warriors is still pending.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 'n-m4',
      icon: 'teams',
      title: 'Join requests',
      description: 'Two new players requested to join Mumbai Warriors.',
      time: '3 days ago',
      unread: false,
    },
  ],
  [ROLES.ORGANIZER]: [
    {
      id: 'n-o1',
      icon: 'teams',
      title: 'Registration needs approval',
      description: 'A new tournament registration requires your review.',
      time: '8 min ago',
      unread: true,
    },
    {
      id: 'n-o2',
      icon: 'clipboard',
      title: '3 approvals waiting',
      description: 'Mumbai Warriors, Delhi Strikers and Pune Panthers are pending.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 'n-o3',
      icon: 'matches',
      title: 'Fixtures ready',
      description: 'Round 4 fixture list is ready to publish.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 'n-o4',
      icon: 'alert',
      title: 'Venue conflict',
      description: 'A clash is flagged for 20 September at 4:00 PM.',
      time: '2 days ago',
      unread: false,
    },
  ],
  [ROLES.PLAYER]: [
    {
      id: 'n-p1',
      icon: 'clipboard',
      title: 'Availability requested',
      description: 'Confirm for Mumbai Warriors vs Delhi Strikers.',
      time: '15 min ago',
      unread: true,
    },
    {
      id: 'n-p2',
      icon: 'finance',
      title: 'Fee pending',
      description: 'September match fee of ₹500 is still unpaid.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 'n-p3',
      icon: 'matches',
      title: 'Squad named',
      description: 'You are in the playing XI for 15 September.',
      time: '2 days ago',
      unread: false,
    },
  ],
  [ROLES.ADMIN]: [
    {
      id: 'n-a1',
      icon: 'user',
      title: 'New registrations',
      description: '12 new users registered on the platform this week.',
      time: '10 min ago',
      unread: true,
    },
    {
      id: 'n-a2',
      icon: 'tournaments',
      title: 'Tournaments created',
      description: '3 tournaments were created today.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 'n-a3',
      icon: 'matches',
      title: 'Matches scheduled',
      description: '8 matches were scheduled across active events.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 'n-a4',
      icon: 'finance',
      title: 'Collections update',
      description: 'Platform collections reached ₹2,45,000 this quarter.',
      time: '3 days ago',
      unread: false,
    },
    {
      id: 'n-a5',
      icon: 'alert',
      title: 'Support tickets',
      description: '2 support tickets need review.',
      time: '3 days ago',
      unread: false,
    },
  ],
}

export function getNotificationItems(role) {
  return ROLE_NOTIFICATIONS[role] ?? ROLE_NOTIFICATIONS[ROLES.CAPTAIN]
}

export function getNotificationCount(role) {
  return getNotificationItems(role).filter((item) => item.unread).length
}
