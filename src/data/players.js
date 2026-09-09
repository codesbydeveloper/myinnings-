export const PLAYERS = [
  {
    id: 'player-001',
    name: 'Arjun Singh',
    team: 'Mumbai Warriors',
    role: 'All-rounder',
    dues: 750,
  },
  {
    id: 'player-002',
    name: 'Rohan Mehta',
    team: 'Mumbai Warriors',
    role: 'Batsman',
    dues: 1500,
  },
  {
    id: 'player-003',
    name: 'Sameer Khan',
    team: 'Mumbai Warriors',
    role: 'Bowler',
    dues: 1200,
  },
  {
    id: 'player-004',
    name: 'Karan Joshi',
    team: 'Delhi Strikers',
    role: 'Wicketkeeper',
    dues: 1800,
  },
  {
    id: 'player-005',
    name: 'Nikhil Verma',
    team: 'Pune Panthers',
    role: 'Batsman',
    dues: 500,
  },
  {
    id: 'player-006',
    name: 'Aditya Nair',
    team: 'Mumbai Warriors',
    role: 'Bowler',
    dues: 0,
  },
]

function makePlayer(id, name, teamId, teamName, teamRole, position, availability, paymentStatus = 'Paid', dues = 0) {
  return {
    id,
    name,
    teamId,
    teamName,
    team: teamName || '',
    teamRole,
    position,
    role: position,
    availability,
    paymentStatus,
    dues,
  }
}

const TEAM_CITIES = {
  'team-001': 'Mumbai',
  'team-002': 'Delhi',
  'team-003': 'Bengaluru',
  'team-004': 'Chennai',
  'team-005': 'Pune',
}

const TEAM_JOINED = {
  'team-001': '12 June 2025',
  'team-002': '18 June 2025',
  'team-003': '4 July 2025',
  'team-004': '21 July 2025',
  'team-005': '9 August 2025',
}

const INACTIVE_IDS = new Set(['player-038', 'player-065'])
const SUSPENDED_IDS = new Set(['player-023'])

const PREVIOUS_TEAMS = {
  'player-001': [
    {
      id: 'team-005',
      name: 'Pune Panthers',
      location: 'Pune',
      joinedDate: '3 March 2024',
      leftDate: '10 June 2025',
      status: 'Former',
    },
  ],
  'player-rohit-mw': [
    {
      id: 'team-002',
      name: 'Delhi Strikers',
      location: 'Delhi',
      joinedDate: '8 January 2024',
      leftDate: '1 June 2025',
      status: 'Former',
    },
  ],
  'player-003': [
    {
      id: 'team-003',
      name: 'Bangalore Blasters',
      location: 'Bengaluru',
      joinedDate: '14 February 2024',
      leftDate: '2 May 2025',
      status: 'Former',
    },
  ],
  'player-005': [
    {
      id: 'team-001',
      name: 'Mumbai Warriors',
      location: 'Mumbai',
      joinedDate: '11 January 2024',
      leftDate: '20 July 2025',
      status: 'Former',
    },
  ],
}

function hashCode(value) {
  return [...String(value)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function statsFor(position, n) {
  const played = 8 + (n % 12)
  const won = Math.min(played, Math.round(played * (0.48 + (n % 6) * 0.06)))
  const isBowler = position === 'Bowler'
  const isBatter = position === 'Batsman' || position === 'Wicket Keeper'
  const runs = isBowler ? 42 + (n % 70) : 160 + (n % 240)
  const highest = isBowler ? 14 + (n % 28) : 42 + (n % 56)
  const average = Number((runs / Math.max(played - 2, 1)).toFixed(1))
  const wickets = isBatter ? n % 5 : 8 + (n % 16)
  const bestFigures = wickets ? `${1 + (n % 5)}/${10 + (n % 24)}` : '-'
  return { played, won, runs, highest, average, wickets, bestFigures }
}

function paymentsFor(player) {
  if (!player.teamId && !player.dues) return []
  const team = player.teamName || 'Club'
  if (player.dues > 0) {
    return [
      {
        id: `${player.id}-pay-1`,
        description: 'September Match Fee',
        event: team,
        amount: player.dues,
        date: '10 September 2026',
        status: player.id === 'player-008' ? 'Overdue' : 'Pending',
      },
      {
        id: `${player.id}-pay-2`,
        description: 'August Match Fee',
        event: team,
        amount: 500,
        date: '12 August 2026',
        status: 'Paid',
      },
    ]
  }
  return [
    {
      id: `${player.id}-pay-1`,
      description: 'September Match Fee',
      event: team,
      amount: 500,
      date: '8 September 2026',
      status: 'Paid',
    },
    {
      id: `${player.id}-pay-2`,
      description: 'Kit Contribution',
      event: team,
      amount: 250,
      date: '20 August 2026',
      status: 'Paid',
    },
  ]
}

function bowlingFor(position, n) {
  if (position === 'Batsman' && n % 3 === 0) return 'Does not bowl'
  const options = ['Right-arm fast', 'Right-arm medium', 'Right-arm off break', 'Left-arm orthodox', 'Left-arm fast']
  return options[n % options.length]
}

export function decoratePlayer(player = {}, index = 0) {
  const n = hashCode(player.id || player.name) + index
  const location = TEAM_CITIES[player.teamId] || 'India'
  const slug = String(player.name || 'player')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')
  const status = INACTIVE_IDS.has(player.id)
    ? 'Inactive'
    : SUSPENDED_IDS.has(player.id)
      ? 'Suspended'
      : 'Active'
  const battingStyle = n % 4 === 0 ? 'Left-hand bat' : 'Right-hand bat'
  const defaults = {
    location,
    email: `${slug}.${String(player.id || 'id').slice(-4)}@myinnings.demo`,
    phone: `+91 9${String(800000000 + (n % 19999999)).padStart(9, '0')}`,
    battingStyle,
    bowlingStyle: bowlingFor(player.position, n),
    status,
    joinedDate: TEAM_JOINED[player.teamId] || '1 June 2025',
    avatar: null,
    previousTeams: PREVIOUS_TEAMS[player.id] || [],
    availabilityByMatch: {},
    stats: statsFor(player.position || 'Batsman', n),
    payments: paymentsFor(player),
  }

  return {
    ...defaults,
    ...player,
    location: player.location || defaults.location,
    email: player.email || defaults.email,
    phone: player.phone || defaults.phone,
    battingStyle: player.battingStyle || defaults.battingStyle,
    bowlingStyle: player.bowlingStyle || defaults.bowlingStyle,
    status: player.status || defaults.status,
    joinedDate: player.joinedDate || defaults.joinedDate,
    avatar: player.avatar ?? null,
    previousTeams: player.previousTeams || defaults.previousTeams,
    availabilityByMatch: player.availabilityByMatch || {},
    stats: player.stats || defaults.stats,
    payments: player.payments?.length ? player.payments : defaults.payments,
    position: player.position || player.role || 'Batsman',
    role: player.position || player.role || 'Batsman',
  }
}

export const SEED_PLAYERS = [
  makePlayer('player-rahul-mw', 'Rahul Sharma', 'team-001', 'Mumbai Warriors', 'Captain', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-rohit-mw', 'Rohit Patel', 'team-001', 'Mumbai Warriors', 'Vice Captain', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-001', 'Arjun Singh', 'team-001', 'Mumbai Warriors', 'Player', 'All-Rounder', 'Available', 'Pending', 750),
  makePlayer('player-003', 'Sameer Khan', 'team-001', 'Mumbai Warriors', 'Player', 'Bowler', 'Available', 'Pending', 1200),
  makePlayer('player-006', 'Aditya Nair', 'team-001', 'Mumbai Warriors', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-007', 'Kunal Desai', 'team-001', 'Mumbai Warriors', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-008', 'Harsh Patel', 'team-001', 'Mumbai Warriors', 'Player', 'Wicket Keeper', 'Pending', 'Pending', 400),
  makePlayer('player-009', 'Vivek Shah', 'team-001', 'Mumbai Warriors', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-010', 'Manish Rao', 'team-001', 'Mumbai Warriors', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-011', 'Yash Kulkarni', 'team-001', 'Mumbai Warriors', 'Player', 'Batsman', 'Not Available', 'Paid'),
  makePlayer('player-012', 'Dev Sharma', 'team-001', 'Mumbai Warriors', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-013', 'Ankit Jain', 'team-001', 'Mumbai Warriors', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-014', 'Soham Iyer', 'team-001', 'Mumbai Warriors', 'Player', 'All-Rounder', 'Pending', 'Pending', 250),
  makePlayer('player-015', 'Farhan Ali', 'team-001', 'Mumbai Warriors', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-016', 'Pranav Joshi', 'team-001', 'Mumbai Warriors', 'Player', 'Wicket Keeper', 'Available', 'Paid'),

  makePlayer('player-002', 'Rohan Mehta', 'team-002', 'Delhi Strikers', 'Captain', 'Batsman', 'Available', 'Pending', 1500),
  makePlayer('player-004', 'Karan Joshi', 'team-002', 'Delhi Strikers', 'Vice Captain', 'Wicket Keeper', 'Available', 'Pending', 1800),
  makePlayer('player-017', 'Aman Kapoor', 'team-002', 'Delhi Strikers', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-018', 'Siddharth Malhotra', 'team-002', 'Delhi Strikers', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-019', 'Raghav Bhatia', 'team-002', 'Delhi Strikers', 'Player', 'Batsman', 'Not Available', 'Paid'),
  makePlayer('player-020', 'Mohit Yadav', 'team-002', 'Delhi Strikers', 'Player', 'Bowler', 'Pending', 'Pending', 600),
  makePlayer('player-021', 'Naveen Grover', 'team-002', 'Delhi Strikers', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-022', 'Ishaan Bansal', 'team-002', 'Delhi Strikers', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-023', 'Kabir Khanna', 'team-002', 'Delhi Strikers', 'Player', 'Bowler', 'Not Available', 'Paid'),
  makePlayer('player-024', 'Tushar Gill', 'team-002', 'Delhi Strikers', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-025', 'Varun Sethi', 'team-002', 'Delhi Strikers', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-026', 'Deepak Negi', 'team-002', 'Delhi Strikers', 'Player', 'Bowler', 'Pending', 'Paid'),
  makePlayer('player-027', 'Sahil Arora', 'team-002', 'Delhi Strikers', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-028', 'Yuvraj Dahiya', 'team-002', 'Delhi Strikers', 'Player', 'Batsman', 'Available', 'Paid'),

  makePlayer('player-029', 'Vikram Rao', 'team-003', 'Bangalore Blasters', 'Captain', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-030', 'Karthik Reddy', 'team-003', 'Bangalore Blasters', 'Vice Captain', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-031', 'Surya Prasad', 'team-003', 'Bangalore Blasters', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-032', 'Nithin Gowda', 'team-003', 'Bangalore Blasters', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-033', 'Adarsh Shetty', 'team-003', 'Bangalore Blasters', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-034', 'Pavan Kumar', 'team-003', 'Bangalore Blasters', 'Player', 'Bowler', 'Pending', 'Pending', 300),
  makePlayer('player-035', 'Rohith Hegde', 'team-003', 'Bangalore Blasters', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-036', 'Manoj Iyer', 'team-003', 'Bangalore Blasters', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-037', 'Ajay Naik', 'team-003', 'Bangalore Blasters', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-038', 'Shreyas Kulkarni', 'team-003', 'Bangalore Blasters', 'Player', 'Batsman', 'Not Available', 'Paid'),
  makePlayer('player-039', 'Gaurav Menon', 'team-003', 'Bangalore Blasters', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-040', 'Harsha Rao', 'team-003', 'Bangalore Blasters', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-041', 'Nikhil Shetty', 'team-003', 'Bangalore Blasters', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-042', 'Abhishek Nair', 'team-003', 'Bangalore Blasters', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-043', 'Ramesh Bhat', 'team-003', 'Bangalore Blasters', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-044', 'Sanjay Urs', 'team-003', 'Bangalore Blasters', 'Player', 'All-Rounder', 'Pending', 'Paid'),

  makePlayer('player-045', 'Arun Krishnan', 'team-004', 'Chennai Titans', 'Captain', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-046', 'Suresh Bala', 'team-004', 'Chennai Titans', 'Vice Captain', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-047', 'Karthikeyan R', 'team-004', 'Chennai Titans', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-048', 'Vignesh Kumar', 'team-004', 'Chennai Titans', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-049', 'Dinesh Pandian', 'team-004', 'Chennai Titans', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-050', 'Murali Shankar', 'team-004', 'Chennai Titans', 'Player', 'Bowler', 'Not Available', 'Paid'),
  makePlayer('player-051', 'Pradeep Raj', 'team-004', 'Chennai Titans', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-052', 'Naveen Subramanian', 'team-004', 'Chennai Titans', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-053', 'Ajith Kumar', 'team-004', 'Chennai Titans', 'Player', 'Bowler', 'Pending', 'Pending', 450),
  makePlayer('player-054', 'Sathish Moorthy', 'team-004', 'Chennai Titans', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-055', 'Gokul Rajan', 'team-004', 'Chennai Titans', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-056', 'Hari Prasad', 'team-004', 'Chennai Titans', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-057', 'Raghavan Iyer', 'team-004', 'Chennai Titans', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-058', 'Balaji Kannan', 'team-004', 'Chennai Titans', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-059', 'Saravanan P', 'team-004', 'Chennai Titans', 'Player', 'Bowler', 'Available', 'Paid'),

  makePlayer('player-rahul-pp', 'Rahul Sharma', 'team-005', 'Pune Panthers', 'Captain', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-060', 'Kavita Deshmukh', 'team-005', 'Pune Panthers', 'Vice Captain', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-005', 'Nikhil Verma', 'team-005', 'Pune Panthers', 'Player', 'Batsman', 'Available', 'Pending', 500),
  makePlayer('player-061', 'Omkar Jadhav', 'team-005', 'Pune Panthers', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-062', 'Sagar Patil', 'team-005', 'Pune Panthers', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-063', 'Rohan Kulkarni', 'team-005', 'Pune Panthers', 'Player', 'Wicket Keeper', 'Pending', 'Paid'),
  makePlayer('player-064', 'Akshay More', 'team-005', 'Pune Panthers', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-065', 'Tejas Shinde', 'team-005', 'Pune Panthers', 'Player', 'Bowler', 'Not Available', 'Paid'),
  makePlayer('player-066', 'Hrishikesh Joshi', 'team-005', 'Pune Panthers', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-067', 'Parth Deshpande', 'team-005', 'Pune Panthers', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-068', 'Niraj Pawar', 'team-005', 'Pune Panthers', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-069', 'Atharva Gokhale', 'team-005', 'Pune Panthers', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-070', 'Shubham Rane', 'team-005', 'Pune Panthers', 'Player', 'Bowler', 'Available', 'Pending', 200),

  makePlayer('player-071', 'Ishaan Kapoor', null, '', 'Player', 'Batsman', 'Available', 'Paid'),
  makePlayer('player-072', 'Mehul Shah', null, '', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-073', 'Ravi Nair', null, '', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-074', 'Tanmay Gupta', null, '', 'Player', 'Wicket Keeper', 'Available', 'Paid'),
  makePlayer('player-075', 'Kabir Singh', null, '', 'Player', 'Batsman', 'Pending', 'Paid'),
  makePlayer('player-076', 'Ayaan Malik', null, '', 'Player', 'Bowler', 'Available', 'Paid'),
  makePlayer('player-077', 'Devansh Chatterjee', null, '', 'Player', 'All-Rounder', 'Available', 'Paid'),
  makePlayer('player-078', 'Rehan Qureshi', null, '', 'Player', 'Batsman', 'Available', 'Paid'),
].map((player, index) => decoratePlayer(player, index))
