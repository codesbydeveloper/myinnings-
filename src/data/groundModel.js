export const FACILITIES = [
  'Parking',
  'Changing Rooms',
  'Washrooms',
  'Floodlights',
  'Seating',
  'Refreshments',
  'Scoreboard',
  'First Aid',
]

export const BOOKING_TYPES = ['Match', 'Tournament', 'Practice', 'Other']

export const BOOKING_STATUSES = ['Upcoming', 'Completed', 'Cancelled']

export const AVAILABILITY_FILTERS = ['Available', 'Partially Booked', 'Fully Booked']

export const CAPACITY_BANDS = [
  { id: 'small', label: 'Small', max: 599 },
  { id: 'medium', label: 'Medium', min: 600, max: 1999 },
  { id: 'large', label: 'Large', min: 2000 },
]

const DETAILS = {
  'ground-001': {
    address: 'North Stand Approach, D Road, Churchgate',
    city: 'Mumbai',
    state: 'Maharashtra',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '21:00',
    description:
      'A well-maintained practice venue next to Wankhede Stadium, used for club matches, nets, and evening floodlit games.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms', 'Floodlights', 'Seating', 'Scoreboard', 'First Aid'],
  },
  'ground-002': {
    address: 'M. Chinnaswamy Stadium Complex, Cubbon Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '20:00',
    description: 'Club ground with two turf pitches and reliable outfield, popular for T20 and corporate fixtures.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms', 'Seating', 'Refreshments', 'Scoreboard'],
  },
  'ground-003': {
    address: 'Maharashtra Cricket Association, Gahunje Road',
    city: 'Pune',
    state: 'Maharashtra',
    pitches: 1,
    openingTime: '06:30',
    closingTime: '19:30',
    description: 'Compact MCA club ground suited to T20 matches and weekday practice sessions.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms', 'Seating', 'First Aid'],
  },
  'ground-004': {
    address: 'Bahadur Shah Zafar Marg, Near ITO',
    city: 'Delhi',
    state: 'Delhi',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '20:00',
    description: 'Practice nets and adjoining ground used by Delhi club sides for preparation and weekend matches.',
    facilities: ['Changing Rooms', 'Washrooms', 'Floodlights', 'Scoreboard', 'First Aid'],
  },
  'ground-005': {
    address: 'Wallajah Road, Chepauk',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '20:30',
    description: 'Club ground attached to the Chepauk complex with a true bounce pitch and covered seating.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms', 'Floodlights', 'Seating', 'Refreshments', 'Scoreboard'],
  },
  'ground-006': {
    address: 'Sector 7, Nerul, Navi Mumbai',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '21:00',
    description: 'Spacious DY Patil practice ground with floodlights and ample parking for travelling teams.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms', 'Floodlights', 'Seating', 'Refreshments', 'First Aid'],
  },
  'ground-007': {
    address: 'KSCA Hubli Cricket Stadium Precinct',
    city: 'Hubli',
    state: 'Karnataka',
    pitches: 1,
    openingTime: '07:00',
    closingTime: '18:00',
    description: 'Currently under maintenance while the outfield and square are being relaid.',
    facilities: ['Parking', 'Changing Rooms', 'Washrooms'],
    status: 'Under Maintenance',
  },
  'ground-008': {
    address: 'Bandra-Kurla Complex, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pitches: 2,
    openingTime: '06:00',
    closingTime: '22:00',
    description:
      'A premier club-and-corporate venue with two pitches, floodlights, and seating for five thousand spectators.',
    facilities: [
      'Parking',
      'Changing Rooms',
      'Washrooms',
      'Floodlights',
      'Seating',
      'Refreshments',
      'Scoreboard',
      'First Aid',
    ],
  },
}

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseTimeToMinutes(value) {
  if (value == null || value === '') return null
  const text = String(value).trim()
  const ampm = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (ampm) {
    let hours = Number(ampm[1])
    const minutes = Number(ampm[2])
    const mer = ampm[3].toUpperCase()
    if (mer === 'PM' && hours !== 12) hours += 12
    if (mer === 'AM' && hours === 12) hours = 0
    return hours * 60 + minutes
  }
  const hm = text.match(/^(\d{1,2}):(\d{2})$/)
  if (hm) return Number(hm[1]) * 60 + Number(hm[2])
  return null
}

export function formatMinutes(total) {
  if (total == null || Number.isNaN(Number(total))) return ''
  const hours24 = Math.floor(Number(total) / 60) % 24
  const minutes = Number(total) % 60
  const mer = hours24 >= 12 ? 'PM' : 'AM'
  const hours = ((hours24 + 11) % 12) + 1
  return `${hours}:${String(minutes).padStart(2, '0')} ${mer}`
}

export function toInputTime(totalOrLabel) {
  if (typeof totalOrLabel === 'string' && /^\d{2}:\d{2}$/.test(totalOrLabel)) return totalOrLabel
  const minutes = typeof totalOrLabel === 'number' ? totalOrLabel : parseTimeToMinutes(totalOrLabel)
  if (minutes == null) return '10:00'
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mins = String(minutes % 60).padStart(2, '0')
  return `${hours}:${mins}`
}

export function durationForFormat(format) {
  if (format === 'ODI' || format === 'One Day' || format === 'Test') return 8 * 60
  return 3 * 60
}

export function capacityBand(capacity) {
  const value = Number(capacity) || 0
  if (value >= 2000) return 'Large'
  if (value >= 600) return 'Medium'
  return 'Small'
}

export function matchesCapacityFilter(capacity, filter) {
  if (!filter || filter === 'all') return true
  const band = capacityBand(capacity).toLowerCase()
  return band === filter
}

export function facilityMatches(list = [], needle) {
  const target = String(needle).toLowerCase().replace(/s$/, '')
  return list.some((item) => item.toLowerCase().replace(/s$/, '') === target || item.toLowerCase().includes(target))
}

export function decorateGround(ground = {}) {
  const extra = DETAILS[ground.id] || {}
  const city = ground.city || extra.city || ground.location || ''
  return {
    openingTime: '06:00',
    closingTime: '21:00',
    address: '',
    state: 'India',
    description: '',
    image: null,
    status: ground.status || extra.status || 'Available',
    ...extra,
    ...ground,
    location: ground.location || extra.city || city,
    city,
    pitches: Number(ground.pitches ?? extra.pitches ?? 1),
    capacity: ground.capacity == null ? extra.capacity ?? null : Number(ground.capacity),
    facilities: ground.facilities?.length
      ? ground.facilities
      : extra.facilities || ['Parking', 'Changing Rooms', 'Washrooms'],
  }
}

export function bookingsOverlap(left, right) {
  if (!left || !right) return false
  if (left.groundId !== right.groundId || left.dateKey !== right.dateKey) return false
  if (left.status === 'Cancelled' || right.status === 'Cancelled') return false
  return Number(left.startMinutes) < Number(right.endMinutes) && Number(left.endMinutes) > Number(right.startMinutes)
}

export function findConflicts(candidate, bookings = [], ignoreId) {
  return bookings.filter((item) => item.id !== ignoreId && bookingsOverlap(candidate, item))
}

export function isGroundAvailable(candidate, bookings = [], ignoreId) {
  return findConflicts(candidate, bookings, ignoreId).length === 0
}

export function bookingFromMatch(match) {
  const startMinutes = parseTimeToMinutes(match.time) ?? 10 * 60
  const endMinutes = Math.min(startMinutes + durationForFormat(match.format), 22 * 60)
  let status = 'Upcoming'
  if (match.status === 'Cancelled' || match.status === 'Draft') status = match.status === 'Draft' ? 'Upcoming' : 'Cancelled'
  if (match.status === 'Completed') status = 'Completed'
  const type = match.tournamentId || match.source === 'tournament' ? 'Tournament' : 'Match'
  return {
    id: `booking-match-${match.id}`,
    code: `BK-${String(match.id).replace(/\D/g, '').padStart(4, '0') || '1000'}`,
    groundId: match.groundId || match.ground?.id || null,
    groundName: match.ground?.name || match.venue || '',
    date: match.date,
    dateKey: match.dateKey,
    startTime: formatMinutes(startMinutes),
    endTime: formatMinutes(endMinutes),
    startMinutes,
    endMinutes,
    type,
    matchId: match.id,
    matchTitle: match.title || `${match.home} vs ${match.away}`,
    tournamentId: match.tournamentId || null,
    tournamentName: match.tournamentName || '',
    notes: '',
    status,
    createdBy: 'Match Management',
    createdDate: match.createdDate || match.date,
    source: 'match',
  }
}

export function groundAvailabilityStatus(ground, bookings = [], nowKey = todayKey()) {
  if (ground.status === 'Under Maintenance') return 'Under Maintenance'
  const active = bookings.filter(
    (item) =>
      item.groundId === ground.id &&
      item.status === 'Upcoming' &&
      item.dateKey >= nowKey,
  )
  if (!active.length) return 'Available'
  const byDate = new Map()
  active.forEach((item) => {
    byDate.set(item.dateKey, (byDate.get(item.dateKey) || 0) + 1)
  })
  const max = Math.max(...byDate.values())
  if (max >= 3) return 'Fully Booked'
  return 'Partially Booked'
}

export function defaultSlots(ground) {
  const open = parseTimeToMinutes(ground?.openingTime || '06:00') ?? 360
  const close = parseTimeToMinutes(ground?.closingTime || '21:00') ?? 1260
  const candidates = [
    { start: 360, end: 540 },
    { start: 540, end: 720 },
    { start: 780, end: 1020 },
    { start: 1020, end: 1200 },
  ]
  return candidates
    .filter((slot) => slot.start >= open - 30 && slot.end <= close + 30)
    .map((slot) => ({
      startMinutes: slot.start,
      endMinutes: slot.end,
      startTime: formatMinutes(slot.start),
      endTime: formatMinutes(slot.end),
      label: `${formatMinutes(slot.start)} – ${formatMinutes(slot.end)}`,
    }))
}

export function nextCode(prefix, items = [], start = 2000) {
  const numbers = items
    .map((item) => Number(String(item.code || '').replace(/\D/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
  const max = numbers.length ? Math.max(...numbers) : start
  return `${prefix}-${max + 1}`
}
