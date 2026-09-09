export const GROUNDS = [
  {
    id: 'ground-001',
    name: 'Wankhede Practice Ground',
    location: 'Mumbai',
    capacity: 800,
    status: 'Available',
  },
  {
    id: 'ground-002',
    name: 'Chinnaswamy Club Ground',
    location: 'Bengaluru',
    capacity: 600,
    status: 'Available',
  },
  {
    id: 'ground-003',
    name: 'MCA Club, Pune',
    location: 'Pune',
    capacity: 500,
    status: 'Available',
  },
  {
    id: 'ground-004',
    name: 'Feroz Shah Kotla Practice Nets',
    location: 'Delhi',
    capacity: 450,
    status: 'Available',
  },
  {
    id: 'ground-005',
    name: 'M. A. Chidambaram Club Ground',
    location: 'Chennai',
    capacity: 700,
    status: 'Available',
  },
  {
    id: 'ground-006',
    name: 'DY Patil Practice Ground',
    location: 'Navi Mumbai',
    capacity: 900,
    status: 'Available',
  },
  {
    id: 'ground-007',
    name: 'KSCA Hubli Ground',
    location: 'Hubli',
    capacity: 400,
    status: 'Under Maintenance',
  },
  {
    id: 'ground-008',
    name: 'Mumbai Cricket Arena',
    location: 'Mumbai',
    capacity: 5000,
    status: 'Available',
  },
]

export function findGround(name) {
  return GROUNDS.find((ground) => ground.name === name) ?? {
    id: `ground-custom-${name}`,
    name,
    location: '',
    capacity: null,
    status: 'Available',
  }
}

export const MATCH_FORMATS = ['T20', 'ODI', 'One Day', 'Friendly', 'Test']

export const FORMAT_OVERS = {
  T20: 20,
  ODI: 50,
  'One Day': 50,
  Friendly: 20,
  Test: 90,
}

export const MATCH_STATUSES = ['Draft', 'Upcoming', 'Live', 'Completed', 'Cancelled']

export const RESULT_TYPES = [
  'Won by Runs',
  'Won by Wickets',
  'Match Drawn',
  'Match Cancelled',
  'No Result',
]

export const PARTICIPANT_STATUSES = ['Included', 'Replaced', 'Excluded', 'Pending Review']
