import { FORMAT_OVERS, GROUNDS } from './grounds'
import { formatDateKey } from './matchModel'

export const TOURNAMENT_FORMATS = ['League', 'Knockout', 'League + Knockout']

export const TOURNAMENT_STATUSES = [
  'Draft',
  'Registration Open',
  'Registration Closed',
  'Fixtures Generated',
  'Ongoing',
  'Completed',
  'Cancelled',
]

export const KNOCKOUT_STAGES = ['Quarter Final', 'Semi Final', 'Final']

const TIMES = ['10:00 AM', '02:30 PM', '04:00 PM']

export function toDateKey(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function approvedRegistrations(tournament) {
  return (tournament.registrations || []).filter((item) => item.status === 'Approved')
}

export function pendingRegistrations(tournament) {
  return (tournament.registrations || []).filter((item) => item.status === 'Pending')
}

export function registeredCount(tournament) {
  return (tournament.registrations || []).filter((item) => item.status !== 'Rejected').length
}

export function tournamentMatches(matches, tournamentId) {
  return (matches || []).filter((match) => match.tournamentId === tournamentId)
}

export function isKnockoutStage(stage) {
  return KNOCKOUT_STAGES.includes(stage)
}

export function isLeagueMatch(match) {
  return !match.stage || match.stage === 'League'
}

export function defaultTimeline(tournament) {
  const status = tournament.status
  const steps = [
    { key: 'Registration Open', label: 'Registration Open' },
    { key: 'Registration Closed', label: 'Registration Closed' },
    { key: 'Fixtures Generated', label: 'Fixtures Generated' },
    { key: 'Ongoing', label: 'Tournament Ongoing' },
    { key: 'Completed', label: 'Tournament Completed' },
  ]
  const order = [
    'Draft',
    'Registration Open',
    'Registration Closed',
    'Fixtures Generated',
    'Ongoing',
    'Completed',
  ]
  const current = Math.max(0, order.indexOf(status))
  return steps.map((step, index) => ({
    ...step,
    done: current > index + 1 || (status === 'Completed' && index <= 4) || current > index,
    current: order[current] === step.key || (status === 'Draft' && index === 0 && false),
  }))
}

export function decorateTournament(raw = {}) {
  const maxTeams = Number(raw.maxTeams) || 12
  const registrations = raw.registrations || []
  const approved = registrations.filter((item) => item.status === 'Approved').length
  return {
    description: '',
    logo: null,
    format: 'League',
    minTeams: 4,
    maxTeams,
    registrationFee: 5000,
    registrationStart: '',
    registrationStartKey: '',
    registrationEnd: '',
    registrationEndKey: '',
    matchFormat: 'T20',
    matchDuration: '3 hours',
    startDate: '',
    startDateKey: '',
    endDate: '',
    endDateKey: '',
    defaultGround: GROUNDS[0]?.name || '',
    organizer: 'Priya Patel',
    organizerId: 'user-002',
    status: 'Registration Open',
    createdDate: '1 August 2026',
    winner: '',
    winnerTeamId: null,
    ...raw,
    location: raw.location || raw.city || '',
    city: raw.city || raw.location || '',
    teams: approved || raw.teams || 0,
    round: raw.round || raw.status || 'Registration Open',
    overs: raw.overs ?? FORMAT_OVERS[raw.matchFormat] ?? 20,
    registrations,
    knockout: raw.knockout || { rounds: [] },
    fixtureMatchIds: raw.fixtureMatchIds || [],
    groundIds:
      Array.isArray(raw.groundIds)
        ? raw.groundIds
        : GROUNDS.find((item) => item.name === raw.defaultGround)
          ? [GROUNDS.find((item) => item.name === raw.defaultGround).id]
          : [],
    grounds: Array.isArray(raw.grounds)
      ? raw.grounds
      : GROUNDS.find((item) => item.name === raw.defaultGround)
        ? [snapshotGround(GROUNDS.find((item) => item.name === raw.defaultGround))]
        : [],
  }
}

export function computeStandings(teams, matches, tournament) {
  const rows = approvedRegistrations(tournament).map((item) => {
    const team = teams.find((entry) => entry.id === item.teamId)
    return {
      teamId: item.teamId,
      teamName: item.teamName,
      shortName: team?.shortName || item.teamName.slice(0, 2).toUpperCase(),
      played: 0,
      won: 0,
      lost: 0,
      draw: 0,
      points: 0,
    }
  })
  const byId = Object.fromEntries(rows.map((row) => [row.teamId, row]))
  const byName = Object.fromEntries(rows.map((row) => [row.teamName, row]))

  tournamentMatches(matches, tournament.id)
    .filter((match) => isLeagueMatch(match) && match.status === 'Completed')
    .forEach((match) => {
      const home = byId[match.homeTeamId] || byName[match.home]
      const away = byId[match.awayTeamId] || byName[match.away]
      if (!home || !away) return
      home.played += 1
      away.played += 1
      const type = match.resultDetail?.type || ''
      if (type === 'Match Drawn' || type === 'No Result' || /drawn/i.test(match.result || '')) {
        home.draw += 1
        away.draw += 1
        home.points += 1
        away.points += 1
        return
      }
      const winner = match.resultDetail?.winner || (match.result || '').split(' won')[0]
      if (winner === home.teamName) {
        home.won += 1
        away.lost += 1
        home.points += 2
      } else if (winner === away.teamName) {
        away.won += 1
        home.lost += 1
        away.points += 2
      }
    })

  return rows.sort((a, b) => b.points - a.points || b.won - a.won || a.teamName.localeCompare(b.teamName))
}

export function roundRobinPairs(teams) {
  const list = [...teams]
  if (list.length < 2) return []
  if (list.length % 2 === 1) list.push(null)
  const rounds = []
  const size = list.length
  const roundCount = size - 1
  for (let round = 0; round < roundCount; round += 1) {
    const pairings = []
    for (let i = 0; i < size / 2; i += 1) {
      const home = list[i]
      const away = list[size - 1 - i]
      if (home && away) pairings.push([home, away])
    }
    rounds.push(pairings)
    const last = list.pop()
    list.splice(1, 0, last)
  }
  return rounds
}

export function distributeDates(startKey, endKey, count) {
  if (!count) return []
  const start = startKey || toDateKey(new Date())
  const end = endKey || addDays(start, Math.max(count, 1))
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  const span = Math.max(0, Math.round((endDate - startDate) / 86400000))
  return Array.from({ length: count }, (_, index) => {
    const offset = count === 1 ? 0 : Math.round((index * span) / (count - 1))
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + offset)
    const dateKey = toDateKey(date)
    return { dateKey, date: formatDateKey(dateKey) }
  })
}

export function snapshotGround(ground) {
  if (!ground) return null
  return {
    id: ground.id,
    name: ground.name,
    location: ground.city || ground.location || '',
    city: ground.city || ground.location || '',
    status: ground.status || 'Available',
    capacity: ground.capacity ?? null,
  }
}

export function groundsForTournament(tournament, catalog = GROUNDS) {
  const byId = new Map()
  catalog.forEach((item) => byId.set(item.id, item))
  ;(tournament?.grounds || []).forEach((item) => {
    if (item?.id && !byId.has(item.id)) byId.set(item.id, item)
  })
  const selected = (tournament?.groundIds || []).map((id) => byId.get(id)).filter(Boolean)
  if (selected.length) return selected
  const named =
    catalog.find((item) => item.name === tournament?.defaultGround) ||
    (tournament?.grounds || []).find((item) => item.name === tournament?.defaultGround)
  if (named) return [named]
  return catalog.filter((item) => item.status !== 'Under Maintenance')
}

export function pickGround(tournament, index, catalog = GROUNDS) {
  const pool = groundsForTournament(tournament, catalog).filter((item) => item.status !== 'Under Maintenance')
  const chosen = pool.length ? pool[index % pool.length] : catalog[0]
  return snapshotGround(chosen) || chosen
}

export function buildLeaguePayloads(tournament, teams) {
  const rounds = roundRobinPairs(teams)
  const pairCount = rounds.reduce((sum, round) => sum + round.length, 0)
  const dates = distributeDates(tournament.startDateKey, tournament.endDateKey, pairCount)
  let cursor = 0
  const payloads = []
  rounds.forEach((pairings, roundIndex) => {
    pairings.forEach(([home, away]) => {
      const slot = dates[cursor] || dates[dates.length - 1]
      const ground = pickGround(tournament, cursor)
      payloads.push({
        homeTeamId: home.teamId || home.id,
        awayTeamId: away.teamId || away.id,
        home: home.teamName || home.name,
        away: away.teamName || away.name,
        date: slot.date,
        dateKey: slot.dateKey,
        time: TIMES[cursor % TIMES.length],
        venue: ground.name,
        ground,
        groundId: ground.id,
        format: tournament.matchFormat,
        overs: tournament.overs,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        stage: 'League',
        round: `Round ${roundIndex + 1}`,
        status: 'Upcoming',
        title: `${tournament.name} · Round ${roundIndex + 1}`,
      })
      cursor += 1
    })
  })
  return payloads
}

function padTeams(teams, size) {
  const padded = [...teams]
  while (padded.length < size) padded.push(null)
  return padded
}

export function buildKnockoutPlan(teams) {
  const n = teams.length
  if (n < 2) return { rounds: [], fixtures: [] }
  if (n === 2) {
    return {
      rounds: ['Final'],
      fixtures: [{ stage: 'Final', round: 'Final', home: teams[0], away: teams[1] }],
    }
  }
  if (n <= 4) {
    const padded = padTeams(teams, 4)
    return {
      rounds: ['Semi Final', 'Final'],
      fixtures: [
        { stage: 'Semi Final', round: 'Semi Final 1', home: padded[0], away: padded[3] },
        { stage: 'Semi Final', round: 'Semi Final 2', home: padded[1], away: padded[2] },
        { stage: 'Final', round: 'Final', home: null, away: null },
      ],
    }
  }
  const padded = padTeams(teams, 8)
  return {
    rounds: ['Quarter Final', 'Semi Final', 'Final'],
    fixtures: [
      { stage: 'Quarter Final', round: 'Quarter Final 1', home: padded[0], away: padded[7] },
      { stage: 'Quarter Final', round: 'Quarter Final 2', home: padded[3], away: padded[4] },
      { stage: 'Quarter Final', round: 'Quarter Final 3', home: padded[1], away: padded[6] },
      { stage: 'Quarter Final', round: 'Quarter Final 4', home: padded[2], away: padded[5] },
      { stage: 'Semi Final', round: 'Semi Final 1', home: null, away: null },
      { stage: 'Semi Final', round: 'Semi Final 2', home: null, away: null },
      { stage: 'Final', round: 'Final', home: null, away: null },
    ],
  }
}

export function buildKnockoutPayloads(tournament, teams, datesStart = 0) {
  const plan = buildKnockoutPlan(teams)
  const dates = distributeDates(
    addDays(tournament.startDateKey || toDateKey(new Date()), datesStart),
    tournament.endDateKey,
    plan.fixtures.length,
  )
  return plan.fixtures.map((fixture, index) => {
    const slot = dates[index] || dates[dates.length - 1]
    const ground = pickGround(tournament, index)
    const home = fixture.home
    const away = fixture.away
    const isBye = Boolean(home) !== Boolean(away)
    const winner = home && !away ? home : away && !home ? away : null
    return {
      homeTeamId: home?.teamId || home?.id || null,
      awayTeamId: away?.teamId || away?.id || null,
      home: home?.teamName || home?.name || (away ? 'Bye' : 'TBD'),
      away: away?.teamName || away?.name || (home ? 'Bye' : 'TBD'),
      date: slot.date,
      dateKey: slot.dateKey,
      time: TIMES[index % TIMES.length],
      venue: ground.name,
      ground,
      groundId: ground.id,
      format: tournament.matchFormat,
      overs: tournament.overs,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      stage: fixture.stage,
      round: fixture.round,
      status: isBye ? 'Completed' : 'Upcoming',
      result: winner ? `${winner.teamName || winner.name} advanced with a bye` : '',
      resultDetail: winner
        ? {
            winner: winner.teamName || winner.name,
            type: 'Won by Wickets',
            summary: `${winner.teamName || winner.name} advanced with a bye`,
          }
        : null,
      title: `${tournament.name} · ${fixture.round}`,
    }
  })
}

export function buildLeagueKnockoutPlaceholders(tournament) {
  const dates = distributeDates(
    addDays(tournament.startDateKey || toDateKey(new Date()), 10),
    tournament.endDateKey,
    3,
  )
  const stages = [
    { stage: 'Semi Final', round: 'Semi Final 1' },
    { stage: 'Semi Final', round: 'Semi Final 2' },
    { stage: 'Final', round: 'Final' },
  ]
  return stages.map((item, index) => {
    const slot = dates[index]
    const ground = pickGround(tournament, index)
    return {
      homeTeamId: null,
      awayTeamId: null,
      home: 'TBD',
      away: 'TBD',
      date: slot.date,
      dateKey: slot.dateKey,
      time: TIMES[index % TIMES.length],
      venue: ground.name,
      ground,
      groundId: ground.id,
      format: tournament.matchFormat,
      overs: tournament.overs,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      stage: item.stage,
      round: item.round,
      status: 'Upcoming',
      title: `${tournament.name} · ${item.round}`,
    }
  })
}

export function leagueStageComplete(tournament, matches) {
  const league = tournamentMatches(matches, tournament.id).filter(isLeagueMatch)
  return league.length > 0 && league.every((match) => ['Completed', 'Cancelled'].includes(match.status))
}

export function matchWinnerName(match) {
  if (!match || match.status !== 'Completed') return ''
  if (match.resultDetail?.winner) return match.resultDetail.winner
  if (/bye/i.test(match.result || '')) {
    return match.home !== 'Bye' && match.home !== 'TBD' ? match.home : match.away
  }
  const text = match.result || ''
  if (/won/i.test(text)) return text.split(' won')[0]
  return ''
}

export function nextKnockoutStage(stage) {
  if (stage === 'Quarter Final') return 'Semi Final'
  if (stage === 'Semi Final') return 'Final'
  return null
}
