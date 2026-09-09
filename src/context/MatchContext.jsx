/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { GROUNDS } from '../data/grounds'
import { MATCHES } from '../data/matches'
import {
  decorateMatch,
  defaultMatchCosts,
  formatTimestamp,
  participantsFromSquad,
} from '../data/matchModel'
import { SEED_PLAYERS } from '../data/players'
import { TEAMS } from '../data/teams'
import { AUTH_STORAGE_KEYS, ROLES } from '../utils/constants'
import { createId } from '../utils/helpers'
import {
  canCancelMatch,
  canChangeMatchAvailability,
  canCreateMatch,
  canEditMatch,
  canManageCosts,
  canManageSquad,
  canRecordResult,
  getMatchableTeams,
} from '../utils/matchAccess'
import { readJson, writeJson } from '../utils/storage'
import { emitActivity, emitNotification } from '../utils/inbox'
import { useAuth } from './AuthContext'
import { useTeams } from './TeamContext'

const MatchContext = createContext(null)

function persist(matches, grounds) {
  writeJson(AUTH_STORAGE_KEYS.matchStore, { matches, grounds })
}

function loadStore() {
  const stored = readJson(AUTH_STORAGE_KEYS.matchStore, null)
  if (stored?.matches?.length) {
    const known = new Set(stored.matches.map((match) => match.id))
    const extras = MATCHES.filter((match) => !known.has(match.id)).map((match) =>
      decorateMatch(match, TEAMS, SEED_PLAYERS),
    )
    return {
      matches: [
        ...stored.matches.map((match) => decorateMatch(match, TEAMS, SEED_PLAYERS)),
        ...extras,
      ],
      grounds: stored.grounds?.length ? stored.grounds : GROUNDS,
    }
  }
  return {
    matches: MATCHES.map((match) => decorateMatch(match, TEAMS, SEED_PLAYERS)),
    grounds: GROUNDS,
  }
}

function patchMatch(matches, matchId, updater) {
  return matches.map((match) => (match.id === matchId ? updater(match) : match))
}

export function MatchProvider({ children }) {
  const { user } = useAuth()
  const { teams, players, setPlayerAvailability } = useTeams()
  const [{ matches, grounds }, setStore] = useState(loadStore)

  const save = useCallback((nextMatches, nextGrounds = grounds) => {
    persist(nextMatches, nextGrounds)
    setStore({ matches: nextMatches, grounds: nextGrounds })
  }, [grounds])

  const getMatch = useCallback(
    (matchId) => matches.find((match) => match.id === matchId) ?? null,
    [matches],
  )

  const createMatch = useCallback((payload) => {
    if (!canCreateMatch(user?.role)) return null
    const allowed = getMatchableTeams(teams, players, user)
    if (!allowed.some((team) => team.id === payload.homeTeamId)) return null
    const id = createId('match')
    const homeTeam = teams.find((team) => team.id === payload.homeTeamId)
    const awayTeam =
      payload.opponentType === 'internal'
        ? teams.find((team) => team.id === payload.awayTeamId)
        : null
    const awayName = awayTeam?.name || payload.opponentName.trim()
    const ground = payload.ground
    const createdDate = formatTimestamp()
    const availability = {}
    players
      .filter((player) => player.teamId === homeTeam?.id)
      .forEach((player) => {
        availability[player.id] = player.availability || 'Pending'
      })

    const match = decorateMatch(
      {
        id,
        home: homeTeam?.name || payload.homeName,
        away: awayName,
        homeTeamId: homeTeam?.id || null,
        awayTeamId: awayTeam?.id || null,
        opponentType: payload.opponentType,
        opponent: {
          name: awayName,
          location: awayTeam?.location || payload.opponentLocation || '',
          contact: payload.opponentContact || '',
          teamId: awayTeam?.id || null,
        },
        date: payload.date,
        dateKey: payload.dateKey,
        time: payload.time,
        venue: ground.name,
        ground,
        groundId: ground.id,
        format: payload.format,
        overs: payload.overs,
        title: payload.title || `${homeTeam?.name} vs ${awayName}`,
        description: payload.description || '',
        status: payload.status || 'Upcoming',
        source: 'standalone',
        createdDate,
        captain: homeTeam?.captain || '',
        availability,
        squad: {
          size: Number(payload.squadSize) || 11,
          selectedIds: [],
          finalized: false,
          finalizedAt: null,
          snapshot: [],
          replacements: [],
        },
        costs: defaultMatchCosts(),
        timeline: [
          { label: 'Match Created', date: createdDate, done: true },
          { label: 'Availability Requested', date: createdDate, done: true },
          { label: 'Squad Selection Pending', date: '', done: false },
          { label: 'Match Day', date: payload.date, done: false },
        ],
      },
      teams,
      players,
    )

    save([match, ...matches])
    emitNotification({
      title: 'New Match Created',
      message: `${match.home} vs ${match.away} has been created. Confirm your availability if you are in the squad.`,
      type: 'match-created',
      category: 'Match',
      relatedEntityType: 'match',
      relatedEntityId: match.id,
      route: `/matches/${match.id}`,
      teamIds: [match.homeTeamId, match.awayTeamId].filter(Boolean),
      playerIds: players
        .filter((player) => player.teamId === match.homeTeamId || player.teamId === match.awayTeamId)
        .map((player) => player.id),
      staffRoles: ['captain', 'manager'],
      includeRoster: true,
      includeAdmin: true,
      actorName: user.name,
    })
    emitActivity({
      title: 'Match Created',
      description: `${match.home} created a match against ${match.away}.`,
      category: 'Match Activity',
      relatedEntityType: 'match',
      relatedEntityId: match.id,
      route: `/matches/${match.id}`,
      actorName: user.name,
      actorId: user.id,
      teamId: match.homeTeamId,
      teamIds: [match.homeTeamId, match.awayTeamId].filter(Boolean),
    })
    return match
  }, [matches, players, save, teams, user])

  const updateMatch = useCallback((matchId, payload) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canEditMatch(current, user, teams)) return null
    let updated = null
    const next = patchMatch(matches, matchId, (match) => {
      updated = {
        ...match,
        ...payload,
        venue: payload.ground?.name || payload.venue || match.venue,
        ground: payload.ground || match.ground,
        groundId: payload.ground?.id || payload.groundId || match.groundId,
      }
      return updated
    })
    save(next)
    if (payload.dateKey || payload.time || payload.ground || payload.title || payload.status) {
      emitNotification({
        title: 'Match updated',
        message: `${updated.home} vs ${updated.away} details were updated.`,
        type: 'match-updated',
        category: 'Match',
        relatedEntityType: 'match',
        relatedEntityId: updated.id,
        route: `/matches/${updated.id}`,
        teamIds: [updated.homeTeamId, updated.awayTeamId].filter(Boolean),
        playerIds: players
          .filter((player) => player.teamId === updated.homeTeamId || player.teamId === updated.awayTeamId)
          .map((player) => player.id),
        staffRoles: ['captain', 'manager'],
        includeRoster: true,
        actorName: user.name,
      })
      emitActivity({
        title: 'Match updated',
        description: `${user.name} updated ${updated.home} vs ${updated.away}.`,
        category: 'Match Activity',
        relatedEntityType: 'match',
        relatedEntityId: updated.id,
        route: `/matches/${updated.id}`,
        actorName: user.name,
        actorId: user.id,
        teamId: updated.homeTeamId,
        teamIds: [updated.homeTeamId].filter(Boolean),
      })
    }
    return updated
  }, [matches, save, teams, user])

  const setMatchStatus = useCallback((matchId, status, extra = {}) => {
    const current = matches.find((item) => item.id === matchId)
    const allowed =
      status === 'Cancelled'
        ? canCancelMatch(current, user, teams)
        : canEditMatch(current, user, teams)
    if (!allowed) return
    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      status,
      ...extra,
    }))
    save(next)
  }, [matches, save, teams, user])

  const cancelMatch = useCallback((matchId, reason) => {
    setMatchStatus(matchId, 'Cancelled', { cancelReason: reason })
  }, [setMatchStatus])

  const setMatchAvailability = useCallback((matchId, playerId, status) => {
    const match = matches.find((item) => item.id === matchId)
    const player = players.find((item) => item.id === playerId)
    if (!canChangeMatchAvailability(match, player, user)) return
    const next = patchMatch(matches, matchId, (item) => ({
      ...item,
      availability: { ...item.availability, [playerId]: status },
    }))
    save(next)
    if (match?.dateKey) {
      setPlayerAvailability(playerId, matchId, status)
    }
    emitNotification({
      title: 'Player availability update',
      message: `${player.name} marked as ${status} for ${match.home} vs ${match.away}.`,
      type: 'availability',
      category: 'Player',
      relatedEntityType: 'match',
      relatedEntityId: match.id,
      route: `/matches/${match.id}`,
      teamIds: [match.homeTeamId].filter(Boolean),
      staffRoles: ['captain', 'manager'],
      excludeUserIds: [user.id],
      actorName: player.name,
    })
    emitActivity({
      title: 'Availability updated',
      description: `${player.name} marked as ${status.toLowerCase()}.`,
      category: 'Player Activity',
      relatedEntityType: 'match',
      relatedEntityId: match.id,
      route: `/matches/${match.id}`,
      actorName: player.name,
      actorId: user.id,
      teamId: match.homeTeamId,
    })
  }, [matches, players, save, setPlayerAvailability, user])

  const setSquadSize = useCallback((matchId, size) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageSquad(current, user, teams) || current?.squad?.finalized) return
    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      squad: { ...match.squad, size: Math.max(1, Number(size) || 11) },
    }))
    save(next)
  }, [matches, save, teams, user])

  const toggleSquadPlayer = useCallback((matchId, playerId) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageSquad(current, user, teams) || current?.squad?.finalized) return
    const next = patchMatch(matches, matchId, (match) => {
      const selected = match.squad.selectedIds.includes(playerId)
        ? match.squad.selectedIds.filter((id) => id !== playerId)
        : [...match.squad.selectedIds, playerId]
      return { ...match, squad: { ...match.squad, selectedIds: selected } }
    })
    save(next)
  }, [matches, save, teams, user])

  const finalizeSquad = useCallback((matchId) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageSquad(current, user, teams) || current?.squad?.finalized) return
    const next = patchMatch(matches, matchId, (match) => {
      const snapshot = match.squad.selectedIds
        .map((id) => players.find((player) => player.id === id))
        .filter(Boolean)
        .map((player) => ({
          id: player.id,
          name: player.name,
          position: player.position,
          teamRole: player.teamRole,
        }))
      const squad = {
        ...match.squad,
        finalized: true,
        finalizedAt: formatTimestamp(),
        snapshot,
      }
      return {
        ...match,
        squad,
        participants: participantsFromSquad(squad, squad.replacements),
        timeline: match.timeline.map((item) =>
          item.label.includes('Squad')
            ? { label: 'Squad Finalized', date: formatTimestamp(), done: true }
            : item,
        ),
      }
    })
    save(next)
    emitNotification({
      title: 'Squad finalized',
      message: `The playing XI for ${current.home} vs ${current.away} has been finalized.`,
      type: 'squad-finalized',
      category: 'Match',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      playerIds: current.squad.selectedIds,
      teamIds: [current.homeTeamId].filter(Boolean),
      staffRoles: ['captain', 'manager'],
      actorName: user.name,
    })
    emitActivity({
      title: 'Squad finalized',
      description: `${current.home} finalized the squad for ${current.home} vs ${current.away}.`,
      category: 'Match Activity',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      actorName: user.name,
      actorId: user.id,
      teamId: current.homeTeamId,
    })
  }, [matches, players, save, teams, user])

  const replaceSquadPlayer = useCallback((matchId, outPlayerId, inPlayerId) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageSquad(current, user, teams)) return
    const next = patchMatch(matches, matchId, (match) => {
      const outPlayer = players.find((player) => player.id === outPlayerId)
      const inPlayer = players.find((player) => player.id === inPlayerId)
      const selectedIds = match.squad.selectedIds
        .filter((id) => id !== outPlayerId)
        .concat(inPlayerId)
      const replacement = {
        id: createId('swap'),
        outPlayerId,
        outName: outPlayer?.name || 'Player',
        inPlayerId,
        inName: inPlayer?.name || 'Player',
        at: formatTimestamp(),
        note: `${outPlayer?.name || 'A player'} was replaced by ${inPlayer?.name || 'a player'}.`,
      }
      const replacements = [...(match.squad.replacements || []), replacement]
      const snapshot = selectedIds
        .map((id) => players.find((player) => player.id === id))
        .filter(Boolean)
        .map((player) => ({
          id: player.id,
          name: player.name,
          position: player.position,
          teamRole: player.teamRole,
        }))
      const squad = { ...match.squad, selectedIds, snapshot, replacements }
      return {
        ...match,
        squad,
        participants: participantsFromSquad(squad, replacements),
      }
    })
    save(next)
    const outPlayer = players.find((player) => player.id === outPlayerId)
    const inPlayer = players.find((player) => player.id === inPlayerId)
    emitNotification({
      title: 'Player replaced',
      message: `${outPlayer?.name || 'A player'} was replaced by ${inPlayer?.name || 'a player'} in ${current.home} vs ${current.away}.`,
      type: 'player-replaced',
      category: 'Match',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      playerIds: [outPlayerId, inPlayerId],
      teamIds: [current.homeTeamId].filter(Boolean),
      staffRoles: ['captain', 'manager'],
      actorName: user.name,
    })
    emitActivity({
      title: 'Player replaced',
      description: `${outPlayer?.name || 'A player'} was replaced by ${inPlayer?.name || 'a player'}.`,
      category: 'Match Activity',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      actorName: user.name,
      actorId: user.id,
      teamId: current.homeTeamId,
    })
  }, [matches, players, save, teams, user])

  const addMatchCost = useCallback((matchId, cost) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageCosts(current, user, teams)) return
    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      costs: [...(match.costs || []), { id: createId('cost'), ...cost }],
    }))
    save(next)
  }, [matches, save, teams, user])

  const updateMatchCost = useCallback((matchId, costId, payload) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageCosts(current, user, teams)) return
    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      costs: (match.costs || []).map((item) =>
        item.id === costId ? { ...item, ...payload } : item,
      ),
    }))
    save(next)
  }, [matches, save, teams, user])

  const removeMatchCost = useCallback((matchId, costId) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canManageCosts(current, user, teams)) return
    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      costs: (match.costs || []).filter((item) => item.id !== costId),
    }))
    save(next)
  }, [matches, save, teams, user])

  const setMatchResult = useCallback((matchId, resultDetail) => {
    const current = matches.find((item) => item.id === matchId)
    if (!canRecordResult(current, user, teams)) return
    let text = resultDetail.summary?.trim()
    if (!text) {
      if (resultDetail.type === 'Won by Runs') {
        text = `${resultDetail.winner} won by ${resultDetail.marginRuns || 0} runs`
      } else if (resultDetail.type === 'Won by Wickets') {
        text = `${resultDetail.winner} won by ${resultDetail.marginWickets || 0} wickets`
      } else {
        text = resultDetail.type
      }
    }

    const next = patchMatch(matches, matchId, (match) => ({
      ...match,
      status: resultDetail.type === 'Match Cancelled' ? 'Cancelled' : 'Completed',
      resultDetail,
      result: text,
      timeline: match.timeline.map((item) =>
        item.label === 'Match Day' ? { ...item, done: true } : item,
      ),
    }))
    save(next)
    emitNotification({
      title: 'Match result updated',
      message: text,
      type: 'match-result',
      category: 'Match',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      teamIds: [current.homeTeamId, current.awayTeamId].filter(Boolean),
      staffRoles: ['captain', 'manager'],
      includeRoster: true,
      includeAdmin: true,
      actorName: user.name,
    })
    emitActivity({
      title: 'Match result updated',
      description: text,
      category: 'Match Activity',
      relatedEntityType: 'match',
      relatedEntityId: current.id,
      route: `/matches/${current.id}`,
      actorName: user.name,
      actorId: user.id,
      teamId: current.homeTeamId,
      teamIds: [current.homeTeamId, current.awayTeamId].filter(Boolean),
    })
  }, [matches, save, teams, user])

  const createTournamentMatches = useCallback((payloads = []) => {
    if (user?.role !== ROLES.ORGANIZER && user?.role !== ROLES.ADMIN) return []
    const created = payloads.map((payload) => {
      const homeTeam = teams.find((team) => team.id === payload.homeTeamId)
      const awayTeam = teams.find((team) => team.id === payload.awayTeamId)
      return decorateMatch(
        {
          id: payload.id || createId('match'),
          home: homeTeam?.name || payload.home || 'TBD',
          away: awayTeam?.name || payload.away || 'TBD',
          homeTeamId: homeTeam?.id || payload.homeTeamId || null,
          awayTeamId: awayTeam?.id || payload.awayTeamId || null,
          date: payload.date,
          dateKey: payload.dateKey,
          time: payload.time || '10:00 AM',
          venue: payload.venue || payload.ground?.name,
          ground: payload.ground,
          groundId: payload.groundId || payload.ground?.id || null,
          format: payload.format || 'T20',
          overs: payload.overs,
          status: payload.status || 'Upcoming',
          source: 'tournament',
          tournamentId: payload.tournamentId,
          tournamentName: payload.tournamentName || '',
          stage: payload.stage || 'League',
          round: payload.round || '',
          result: payload.result || '',
          resultDetail: payload.resultDetail || null,
          title: payload.title || '',
        },
        teams,
        players,
      )
    })
    save([...created, ...matches])
    return created
  }, [matches, players, save, teams, user])

  const addCustomGround = useCallback((ground) => {
    if (!canCreateMatch(user?.role) && user?.role !== ROLES.ORGANIZER) return null
    const nextGround = {
      id: createId('ground'),
      name: ground.name.trim(),
      location: ground.location.trim(),
      capacity: ground.capacity ? Number(ground.capacity) : null,
      status: 'Available',
      custom: true,
    }
    const nextGrounds = [nextGround, ...grounds]
    persist(matches, nextGrounds)
    setStore({ matches, grounds: nextGrounds })
    return nextGround
  }, [grounds, matches, user])

  const value = useMemo(
    () => ({
      matches,
      grounds,
      getMatch,
      createMatch,
      updateMatch,
      setMatchStatus,
      cancelMatch,
      setMatchAvailability,
      setSquadSize,
      toggleSquadPlayer,
      finalizeSquad,
      replaceSquadPlayer,
      addMatchCost,
      updateMatchCost,
      removeMatchCost,
      setMatchResult,
      createTournamentMatches,
      addCustomGround,
    }),
    [
      addCustomGround,
      addMatchCost,
      cancelMatch,
      createMatch,
      createTournamentMatches,
      finalizeSquad,
      getMatch,
      grounds,
      matches,
      removeMatchCost,
      replaceSquadPlayer,
      setMatchAvailability,
      setMatchResult,
      setMatchStatus,
      setSquadSize,
      toggleSquadPlayer,
      updateMatch,
      updateMatchCost,
    ],
  )

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
}

export function useMatches() {
  const context = useContext(MatchContext)
  if (!context) {
    throw new Error('useMatches must be used within MatchProvider')
  }
  return context
}
