import { FORMAT_OVERS, findGround } from './grounds'
import { TEAMS } from './teams'

const TOURNAMENT_MATCH_IDS = new Set(['match-002', 'match-004'])

function teamByName(name, teams = TEAMS) {
  return teams.find((team) => team.name === name) ?? null
}

function emptySquad() {
  return {
    size: 11,
    selectedIds: [],
    finalized: false,
    finalizedAt: null,
    snapshot: [],
    replacements: [],
  }
}

function availabilityFromRoster(teamId, players = []) {
  const map = {}
  players
    .filter((player) => player.teamId === teamId)
    .forEach((player) => {
      map[player.id] = player.availability || 'Pending'
    })
  return map
}

function completedSquad(teamId, players = []) {
  const roster = players.filter((player) => player.teamId === teamId)
  const available = roster.filter((player) => player.availability === 'Available')
  const picked = (available.length >= 11 ? available : roster).slice(0, 11)
  return {
    size: 11,
    selectedIds: picked.map((player) => player.id),
    finalized: true,
    finalizedAt: '1 August 2026, 6:00 PM',
    snapshot: picked.map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      teamRole: player.teamRole,
    })),
    replacements: [],
  }
}

function parseResult(match) {
  if (!match.result) return null
  const text = match.result
  if (/drawn/i.test(text)) {
    return { winner: '', type: 'Match Drawn', marginRuns: '', marginWickets: '', summary: text }
  }
  const byRuns = text.match(/won by (\d+) runs/i)
  const byWickets = text.match(/won by (\d+) wickets/i)
  const winner = text.split(' won')[0] || match.home
  return {
    winner,
    type: byWickets ? 'Won by Wickets' : 'Won by Runs',
    marginRuns: byRuns ? byRuns[1] : '',
    marginWickets: byWickets ? byWickets[1] : '',
    summary: text,
  }
}

export function defaultMatchCosts() {
  return [
    { id: 'cost-ground', label: 'Ground Fee', amount: 5000 },
    { id: 'cost-umpire', label: 'Umpire Fee', amount: 2000 },
    { id: 'cost-equipment', label: 'Equipment', amount: 1500 },
  ]
}

export function participantsFromSquad(squad, replacements = []) {
  const included = (squad.snapshot?.length ? squad.snapshot : []).map((player) => ({
    playerId: player.id,
    name: player.name,
    status: 'Included',
  }))
  const replaced = replacements.map((item) => ({
    playerId: item.outPlayerId,
    name: item.outName,
    status: 'Replaced',
    replacedBy: item.inName,
    contribution: 'Pending Review',
  }))
  const incoming = replacements.map((item) => ({
    playerId: item.inPlayerId,
    name: item.inName,
    status: 'Included',
    replacementFor: item.outName,
    contribution: 'Included',
  }))
  const seen = new Set()
  return [...replaced, ...included, ...incoming].filter((item) => {
    const key = `${item.playerId}-${item.status}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function decorateMatch(match, teams = TEAMS, players = []) {
  const homeTeam = teamByName(match.home, teams)
  const awayTeam = teamByName(match.away, teams)
  const ground = match.ground || findGround(match.venue)
  const completed = match.status === 'Completed'
  const squad = match.squad || (completed && homeTeam ? completedSquad(homeTeam.id, players) : emptySquad())
  const availability =
    match.availability || (homeTeam ? availabilityFromRoster(homeTeam.id, players) : {})
  const replacements = squad.replacements || []
  const costs = match.costs || defaultMatchCosts()
  const resultDetail = match.resultDetail || parseResult(match)

  return {
    ...match,
    opponentType: match.opponentType || (awayTeam ? 'internal' : 'external'),
    opponent: match.opponent || {
      name: match.away,
      location: awayTeam?.location || '',
      contact: '',
      teamId: awayTeam?.id || null,
    },
    homeTeamId: match.homeTeamId || homeTeam?.id || null,
    awayTeamId: match.awayTeamId || awayTeam?.id || null,
    groundId: match.groundId || ground.id,
    ground,
    venue: match.venue || ground.name,
    overs: match.overs ?? FORMAT_OVERS[match.format] ?? 20,
    title: match.title || `${match.home} vs ${match.away}`,
    description: match.description || '',
    source: match.source || (match.tournamentId || TOURNAMENT_MATCH_IDS.has(match.id) ? 'tournament' : 'standalone'),
    createdDate: match.createdDate || '1 August 2026',
    timeline: match.timeline || [
      { label: 'Match Created', date: match.createdDate || '1 August 2026', done: true },
      { label: 'Availability Requested', date: '2 August 2026', done: true },
      {
        label: completed ? 'Squad Finalized' : 'Squad Selection Pending',
        date: completed ? '4 August 2026' : '',
        done: completed,
      },
      { label: 'Match Day', date: match.date, done: completed },
    ],
    availability,
    squad: { ...emptySquad(), ...squad, replacements },
    costs,
    participants: match.participants || (completed ? participantsFromSquad(squad, replacements) : []),
    resultDetail,
    cancelReason: match.cancelReason || '',
    captain: match.captain || homeTeam?.captain || '',
  }
}

export function totalMatchCost(costs = []) {
  return costs.reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export function estimatedPerPlayer(costs, squadSize) {
  const size = Number(squadSize) || 0
  if (!size) return 0
  return totalMatchCost(costs) / size
}

export function formatDateKey(dateKey) {
  if (!dateKey) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? new Date(`${dateKey}T00:00:00`) : new Date(dateKey)
  if (Number.isNaN(date.getTime())) return String(dateKey)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTimestamp(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  return `${day}, ${time}`
}
