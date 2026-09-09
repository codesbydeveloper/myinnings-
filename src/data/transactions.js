import { ROLES } from '../utils/constants'

export const ROLE_TRANSACTIONS = {
  [ROLES.CAPTAIN]: [
    { id: 'tx-c1', title: 'Rohit Patel', category: 'Match Fee', date: '7 Sep 2026', amount: 1500, type: 'in', status: 'Received' },
    { id: 'tx-c2', title: 'Ground Booking', category: 'Expense', date: '6 Sep 2026', amount: 4000, type: 'out', status: 'Expense' },
    { id: 'tx-c3', title: 'Rohan Mehta', category: 'Match Fee', date: '4 Sep 2026', amount: 1500, type: 'in', status: 'Pending' },
    { id: 'tx-c4', title: 'Umpire Fees', category: 'Expense', date: '1 Sep 2026', amount: 1200, type: 'out', status: 'Expense' },
  ],
  [ROLES.MANAGER]: [
    { id: 'tx-m1', title: 'Kit Contribution', category: 'Collection', date: '7 Sep 2026', amount: 2500, type: 'in', status: 'Received' },
    { id: 'tx-m2', title: 'Ground Booking', category: 'Expense', date: '6 Sep 2026', amount: 4000, type: 'out', status: 'Expense' },
    { id: 'tx-m3', title: 'Water & logistics', category: 'Expense', date: '5 Sep 2026', amount: 850, type: 'out', status: 'Expense' },
  ],
  [ROLES.ORGANIZER]: [
    { id: 'tx-o1', title: 'MPL Registration', category: 'Registration Fees', date: '7 Sep 2026', amount: 12000, type: 'in', status: 'Received' },
    { id: 'tx-o2', title: 'Venue Hire', category: 'Expense', date: '6 Sep 2026', amount: 18000, type: 'out', status: 'Expense' },
    { id: 'tx-o3', title: 'Corporate Cup entry', category: 'Registration Fees', date: '4 Sep 2026', amount: 8000, type: 'in', status: 'Received' },
  ],
  [ROLES.PLAYER]: [
    { id: 'tx-p1', title: 'September Match Fee', category: 'Match Fee', date: '12 Sep 2026', amount: 500, type: 'out', status: 'Pending' },
    { id: 'tx-p2', title: 'Kit Contribution', category: 'Team Dues', date: '18 Sep 2026', amount: 250, type: 'out', status: 'Pending' },
    { id: 'tx-p3', title: 'August Match Fee', category: 'Match Fee', date: '12 Aug 2026', amount: 500, type: 'out', status: 'Paid' },
  ],
  [ROLES.ADMIN]: [
    { id: 'tx-a1', title: 'Platform collections', category: 'Revenue', date: '7 Sep 2026', amount: 42000, type: 'in', status: 'Received' },
    { id: 'tx-a2', title: 'Cloud & operations', category: 'Expense', date: '5 Sep 2026', amount: 8600, type: 'out', status: 'Expense' },
    { id: 'tx-a3', title: 'Tournament fees', category: 'Revenue', date: '3 Sep 2026', amount: 28000, type: 'in', status: 'Received' },
  ],
}

export function getTransactions(role) {
  return ROLE_TRANSACTIONS[role] ?? ROLE_TRANSACTIONS[ROLES.CAPTAIN]
}
