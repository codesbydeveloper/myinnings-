import { ROLES } from '../utils/constants'

export const ROLE_ACTIVITIES = {
  [ROLES.CAPTAIN]: [
    { id: 'act-c1', icon: 'matches', text: 'Rahul Sharma created a new match.', time: '10 minutes ago' },
    { id: 'act-c2', icon: 'players', text: 'Amit Kumar added a new player.', time: '2 hours ago' },
    { id: 'act-c3', icon: 'finance', text: 'Payment received from Rohit Patel.', time: 'Yesterday' },
    { id: 'act-c4', icon: 'clipboard', text: 'Squad shortlist updated for 15 September.', time: 'Yesterday' },
    { id: 'act-c5', icon: 'teams', text: 'Mumbai Warriors availability closed at 12/15.', time: '3 days ago' },
  ],
  [ROLES.MANAGER]: [
    { id: 'act-m1', icon: 'players', text: 'Amit Kumar added a new player.', time: '2 hours ago' },
    { id: 'act-m2', icon: 'clipboard', text: 'Ground booking reminder sent for 20 September.', time: 'Yesterday' },
    { id: 'act-m3', icon: 'finance', text: 'Match fee reminder sent to 4 players.', time: 'Yesterday' },
    { id: 'act-m4', icon: 'teams', text: 'Mumbai Warriors squad list was updated.', time: '3 days ago' },
  ],
  [ROLES.ORGANIZER]: [
    { id: 'act-o1', icon: 'check', text: 'Priya Patel approved Mumbai Warriors.', time: '10 minutes ago' },
    { id: 'act-o2', icon: 'tournaments', text: 'Tournament fixture was updated.', time: '2 hours ago' },
    { id: 'act-o3', icon: 'teams', text: 'Delhi Strikers submitted a registration.', time: 'Yesterday' },
    { id: 'act-o4', icon: 'matches', text: 'Round 4 fixtures published for MPL 2026.', time: '3 days ago' },
  ],
  [ROLES.PLAYER]: [
    { id: 'act-p1', icon: 'check', text: 'Arjun Singh marked himself as available.', time: '10 minutes ago' },
    { id: 'act-p2', icon: 'matches', text: 'You were named in the squad for 15 September.', time: '2 hours ago' },
    { id: 'act-p3', icon: 'finance', text: 'August match fee marked as paid.', time: 'Yesterday' },
    { id: 'act-p4', icon: 'tournaments', text: 'You scored 38 vs Pune Panthers.', time: '3 days ago' },
  ],
  [ROLES.ADMIN]: [
    { id: 'act-a1', icon: 'user', text: '12 new users registered this week.', time: '10 minutes ago' },
    { id: 'act-a2', icon: 'tournaments', text: '3 tournaments were created today.', time: '2 hours ago' },
    { id: 'act-a3', icon: 'matches', text: '8 matches were scheduled across events.', time: 'Yesterday' },
    { id: 'act-a4', icon: 'finance', text: 'August finance report is ready.', time: '3 days ago' },
  ],
}

export function getActivities(role) {
  return ROLE_ACTIVITIES[role] ?? ROLE_ACTIVITIES[ROLES.CAPTAIN]
}
