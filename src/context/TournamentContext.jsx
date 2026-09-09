/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { decorateTournament } from '../data/tournamentModel'
import {
  approvedRegistrations,
  buildKnockoutPayloads,
  buildLeagueKnockoutPlaceholders,
  buildLeaguePayloads,
  computeStandings,
  leagueStageComplete,
  matchWinnerName,
  nextKnockoutStage,
  tournamentMatches,
} from '../data/tournamentModel'
import { TOURNAMENTS } from '../data/tournaments'
import { AUTH_STORAGE_KEYS, ROLES } from '../utils/constants'
import { createId } from '../utils/helpers'
import {
  canApproveRegistrations,
  canCompleteTournament,
  canCreateTournament,
  canEditTournament,
  canGenerateFixtures,
  canManageTournament,
  canRegisterForTournament,
} from '../utils/tournamentAccess'
import { readJson, writeJson } from '../utils/storage'
import { emitActivity, emitNotification } from '../utils/inbox'
import { useAuth } from './AuthContext'
import { useMatches } from './MatchContext'
import { useTeams } from './TeamContext'
import { formatTimestamp as matchStamp } from '../data/matchModel'

const TournamentContext = createContext(null)

function inboxFromTournamentNote(note, tournament, actorName = '') {
  const title = note.title || ''
  const route = tournament?.id ? `/tournaments/${tournament.id}` : '/tournaments'
  const registeredIds = (tournament?.registrations || [])
    .filter((item) => item.status === 'Approved' || item.status === 'Pending')
    .map((item) => item.teamId)
    .filter(Boolean)
  const teamIds = note.teamIds || (note.teamId ? [note.teamId] : [])
  const base = {
    title: note.title,
    message: note.description,
    category: 'Tournament',
    relatedEntityType: 'tournament',
    relatedEntityId: tournament?.id || null,
    route,
    icon: note.icon || 'tournaments',
    actorName,
    teamId: note.teamId || null,
    includeAdmin: true,
    organizerId: tournament?.organizerId,
    organizerName: tournament?.organizer,
  }

  if (/submitted|registered/i.test(title)) {
    emitNotification({
      ...base,
      type: 'registration-submitted',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
    })
  } else if (/approved/i.test(title)) {
    emitNotification({
      ...base,
      type: 'registration-approved',
      teamIds,
      staffRoles: ['captain', 'manager'],
    })
  } else if (/rejected/i.test(title)) {
    emitNotification({
      ...base,
      type: 'registration-rejected',
      teamIds,
      staffRoles: ['captain', 'manager'],
    })
  } else if (/fixture/i.test(title)) {
    emitNotification({
      ...base,
      type: 'fixtures',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
      teamIds: note.teamIds || registeredIds,
      staffRoles: ['captain', 'manager'],
    })
  } else if (/begin|ongoing|started/i.test(title)) {
    emitNotification({
      ...base,
      type: 'tournament-started',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
      teamIds: note.teamIds || registeredIds,
      staffRoles: ['captain', 'manager'],
    })
  } else if (/qualif|knockout stage populated/i.test(title)) {
    emitNotification({
      ...base,
      type: 'knockout',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
      teamIds: note.teamIds || (note.teamId ? [note.teamId] : registeredIds),
      staffRoles: ['captain', 'manager'],
    })
  } else if (/complete|champion/i.test(title)) {
    emitNotification({
      ...base,
      type: 'tournament-complete',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
      teamIds: note.teamIds || registeredIds,
      staffRoles: ['captain', 'manager'],
    })
  } else {
    emitNotification({
      ...base,
      type: 'tournament',
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
    })
  }

  emitActivity({
    title: note.title,
    description: note.description,
    category: 'Tournament Activity',
    relatedEntityType: 'tournament',
    relatedEntityId: tournament?.id || null,
    route,
    actorName,
    teamId: note.teamId || null,
    teamIds: note.teamIds || teamIds,
    icon: note.icon || 'tournaments',
  })
}

function persist(tournaments, notifications) {
  writeJson(AUTH_STORAGE_KEYS.tournamentStore, { tournaments, notifications })
}

function loadStore() {
  const stored = readJson(AUTH_STORAGE_KEYS.tournamentStore, null)
  if (stored?.tournaments?.length) {
    const known = new Set(stored.tournaments.map((item) => item.id))
    const extras = TOURNAMENTS.filter((item) => !known.has(item.id)).map(decorateTournament)
    return {
      tournaments: [
        ...stored.tournaments.map(decorateTournament),
        ...extras,
      ],
      notifications: stored.notifications || [],
    }
  }
  return {
    tournaments: TOURNAMENTS.map(decorateTournament),
    notifications: [],
  }
}

function patchTournament(list, tournamentId, updater) {
  return list.map((item) => (item.id === tournamentId ? updater(item) : item))
}

function stamp() {
  try {
    return matchStamp()
  } catch {
    return new Date().toLocaleString('en-IN')
  }
}

export function TournamentProvider({ children }) {
  const { user } = useAuth()
  const { teams } = useTeams()
  const { matches, createTournamentMatches, updateMatch, getMatch } = useMatches()
  const [{ tournaments, notifications }, setStore] = useState(loadStore)

  const save = useCallback((nextTournaments, nextNotes = notifications) => {
    persist(nextTournaments, nextNotes)
    setStore({ tournaments: nextTournaments, notifications: nextNotes })
  }, [notifications])

  const pushNote = useCallback((nextTournaments, note) => {
    const entry = {
      id: createId('tnote'),
      icon: note.icon || 'tournaments',
      title: note.title,
      description: note.description,
      time: stamp(),
      unread: true,
      roles: note.roles || [ROLES.ORGANIZER, ROLES.ADMIN],
      teamId: note.teamId || null,
    }
    const nextNotes = [entry, ...notifications].slice(0, 50)
    save(nextTournaments, nextNotes)
    const tournament =
      nextTournaments.find((item) => item.id === note.tournamentId) ||
      nextTournaments.find((item) => note.description?.includes(item.name))
    inboxFromTournamentNote(note, tournament, user?.name)
  }, [notifications, save, user])

  const getTournament = useCallback(
    (id) => tournaments.find((item) => item.id === id) ?? null,
    [tournaments],
  )

  const createTournament = useCallback((payload) => {
    if (!canCreateTournament(user?.role)) return null
    const tournament = decorateTournament({
      id: createId('tournament'),
      ...payload,
      organizer: user.name,
      organizerId: user.id,
      status: payload.status || 'Registration Open',
      createdDate: stamp(),
      registrations: [],
      fixtureMatchIds: [],
      knockout: { rounds: [] },
      winner: '',
      city: payload.location,
    })
    save([tournament, ...tournaments])
    emitNotification({
      title: 'Tournament created',
      message: `${tournament.name} is open for team registration.`,
      type: 'tournament-created',
      category: 'Tournament',
      relatedEntityType: 'tournament',
      relatedEntityId: tournament.id,
      route: `/tournaments/${tournament.id}`,
      roles: [ROLES.ORGANIZER, ROLES.ADMIN],
      includeAdmin: true,
      organizerId: user.id,
      actorName: user.name,
    })
    emitActivity({
      title: 'Tournament created',
      description: `${user.name} created ${tournament.name}.`,
      category: 'Tournament Activity',
      relatedEntityType: 'tournament',
      relatedEntityId: tournament.id,
      route: `/tournaments/${tournament.id}`,
      actorName: user.name,
      actorId: user.id,
    })
    return tournament
  }, [save, tournaments, user])

  const updateTournament = useCallback((tournamentId, payload) => {
    const current = getTournament(tournamentId)
    if (!canEditTournament(current, user)) return
    save(
      patchTournament(tournaments, tournamentId, (item) =>
        decorateTournament({ ...item, ...payload, city: payload.location || item.city }),
      ),
    )
  }, [getTournament, tournaments, save, user])

  const setTournamentStatus = useCallback((tournamentId, status) => {
    const current = getTournament(tournamentId)
    if (!canManageTournament(current, user)) return
    const next = patchTournament(tournaments, tournamentId, (item) => ({ ...item, status, round: status }))
    if (status === 'Ongoing') {
      pushNote(next, {
        title: 'Tournament begins',
        description: `${current.name} is now ongoing.`,
        icon: 'matches',
        tournamentId: current.id,
        teamIds: approvedRegistrations(current).map((item) => item.teamId),
        roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER],
      })
    } else {
      save(next)
    }
  }, [getTournament, pushNote, save, tournaments, user])

  const registerTeam = useCallback((tournamentId, teamId) => {
    const tournament = getTournament(tournamentId)
    if (!canRegisterForTournament(tournament, user) && user?.role !== ROLES.ADMIN) {
      return { ok: false, message: 'You cannot register a team for this tournament.' }
    }
    const approved = approvedRegistrations(tournament).length
    if (approved >= tournament.maxTeams) {
      return { ok: false, message: 'Maximum team limit has been reached.' }
    }
    if ((tournament.registrations || []).some((item) => item.teamId === teamId && item.status !== 'Rejected')) {
      return { ok: false, message: 'This team is already registered.' }
    }
    const team = teams.find((item) => item.id === teamId)
    if (!team) return { ok: false, message: 'Team not found.' }
    const registration = {
      id: createId('treg'),
      teamId: team.id,
      teamName: team.name,
      captain: team.captain || '',
      players: team.players || 0,
      date: stamp(),
      status: 'Pending',
      reason: '',
    }
    const next = patchTournament(tournaments, tournamentId, (item) => ({
      ...item,
      registrations: [...(item.registrations || []), registration],
    }))
    pushNote(next, {
      title: 'Team registration submitted',
      description: `${team.name} registered for ${tournament.name}.`,
      icon: 'teams',
      teamId: team.id,
      tournamentId: tournament.id,
      roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER],
    })
    return { ok: true, registration }
  }, [getTournament, pushNote, teams, tournaments, user])

  const approveTeam = useCallback((tournamentId, registrationId) => {
    const tournament = getTournament(tournamentId)
    if (!canApproveRegistrations(tournament, user)) {
      return { ok: false, message: 'You cannot approve registrations.' }
    }
    if (approvedRegistrations(tournament).length >= tournament.maxTeams) {
      return { ok: false, message: 'Maximum team limit has been reached.' }
    }
    const target = (tournament.registrations || []).find((item) => item.id === registrationId)
    const next = patchTournament(tournaments, tournamentId, (item) => {
      const registrations = (item.registrations || []).map((entry) =>
        entry.id === registrationId ? { ...entry, status: 'Approved' } : entry,
      )
      const count = registrations.filter((entry) => entry.status === 'Approved').length
      return { ...item, registrations, teams: count }
    })
    pushNote(next, {
      title: 'Registration approved',
      description: `${target?.teamName || 'A team'} has been approved for ${tournament.name}.`,
      icon: 'check',
      teamId: target?.teamId,
      tournamentId: tournament.id,
      roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER, ROLES.PLAYER],
    })
    return { ok: true }
  }, [getTournament, pushNote, tournaments, user])

  const rejectTeam = useCallback((tournamentId, registrationId, reason = '') => {
    const tournament = getTournament(tournamentId)
    if (!canApproveRegistrations(tournament, user)) {
      return { ok: false, message: 'You cannot reject registrations.' }
    }
    const target = (tournament.registrations || []).find((item) => item.id === registrationId)
    const next = patchTournament(tournaments, tournamentId, (item) => {
      const registrations = (item.registrations || []).map((entry) =>
        entry.id === registrationId ? { ...entry, status: 'Rejected', reason } : entry,
      )
      const count = registrations.filter((entry) => entry.status === 'Approved').length
      return { ...item, registrations, teams: count }
    })
    pushNote(next, {
      title: 'Registration rejected',
      description: `${target?.teamName || 'A team'} was not approved for ${tournament.name}.`,
      icon: 'alert',
      teamId: target?.teamId,
      tournamentId: tournament.id,
      roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER],
    })
    return { ok: true }
  }, [getTournament, pushNote, tournaments, user])

  const generateFixtures = useCallback((tournamentId) => {
    const tournament = getTournament(tournamentId)
    if (!canGenerateFixtures(tournament, user)) {
      return { ok: false, message: 'You cannot generate fixtures.' }
    }
    const approved = approvedRegistrations(tournament)
    if (approved.length < tournament.minTeams) {
      return {
        ok: false,
        message: `At least ${tournament.minTeams} approved teams are required.`,
      }
    }
    if ((tournament.fixtureMatchIds || []).length) {
      return { ok: false, message: 'Fixtures have already been generated.' }
    }

    const squad = approved.map((item) => ({
      id: item.teamId,
      teamId: item.teamId,
      name: item.teamName,
      teamName: item.teamName,
    }))

    const payloads =
      tournament.format === 'League'
        ? buildLeaguePayloads(tournament, squad)
        : tournament.format === 'Knockout'
          ? buildKnockoutPayloads(tournament, squad)
          : [...buildLeaguePayloads(tournament, squad), ...buildLeagueKnockoutPlaceholders(tournament)]

    const created = createTournamentMatches(payloads)
    if (!created.length) {
      return { ok: false, message: 'Could not create tournament matches.' }
    }

    const knockoutStages = ['Quarter Final', 'Semi Final', 'Final']
    const knockout = {
      rounds: knockoutStages
        .map((name) => ({
          name,
          matchIds: created.filter((match) => match.stage === name).map((match) => match.id),
        }))
        .filter((round) => round.matchIds.length),
    }

    const next = patchTournament(tournaments, tournamentId, (item) => ({
      ...item,
      fixtureMatchIds: created.map((match) => match.id),
      knockout,
      status: 'Fixtures Generated',
      round: 'Fixtures Generated',
    }))
    pushNote(next, {
      title: 'Fixtures generated',
      description: `Fixtures for ${tournament.name} are ready.`,
      icon: 'matches',
      tournamentId: tournament.id,
      teamIds: approved.map((item) => item.teamId),
      roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER],
    })
    return { ok: true, matches: created }
  }, [createTournamentMatches, getTournament, pushNote, tournaments, user])

  const completeTournament = useCallback((tournamentId, winnerName = '') => {
    const tournament = getTournament(tournamentId)
    if (!canCompleteTournament(tournament, user)) return { ok: false, message: 'Not allowed.' }
    const standings = computeStandings(teams, matches, tournament)
    const finalMatch = tournamentMatches(matches, tournamentId).find((match) => match.stage === 'Final')
    const winner =
      winnerName ||
      tournament.winner ||
      matchWinnerName(finalMatch) ||
      standings[0]?.teamName ||
      ''
    const winnerTeam = teams.find((team) => team.name === winner)
    const next = patchTournament(tournaments, tournamentId, (item) => ({
      ...item,
      status: 'Completed',
      round: 'Completed',
      winner,
      winnerTeamId: winnerTeam?.id || item.winnerTeamId || null,
    }))
    save(next)
    inboxFromTournamentNote(
      {
        title: 'Tournament completed',
        description: winner
          ? `${tournament.name} is complete. Winner: ${winner}.`
          : `${tournament.name} has been marked complete.`,
        icon: 'tournaments',
        tournamentId: tournament.id,
        teamId: winnerTeam?.id,
        roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER, ROLES.PLAYER],
      },
      { ...tournament, status: 'Completed', winner },
      user?.name,
    )
    return { ok: true, winner }
  }, [getTournament, matches, save, teams, tournaments, user])

  const advanceFromResult = useCallback((matchId, resultDetail) => {
    const current = getMatch(matchId)
    if (!current?.tournamentId) return
    const match = {
      ...current,
      status: resultDetail?.type === 'Match Cancelled' ? 'Cancelled' : 'Completed',
      resultDetail: resultDetail || current.resultDetail,
      result: resultDetail?.summary || current.result,
    }
    const tournament = getTournament(match.tournamentId)
    if (!tournament || tournament.status === 'Completed') return
    const related = tournamentMatches(matches, tournament.id).map((item) =>
      item.id === match.id ? match : item,
    )
    let nextTournaments = tournaments

    const winner = matchWinnerName(match)
    if (winner && match.stage && nextKnockoutStage(match.stage)) {
      const nextStage = nextKnockoutStage(match.stage)
      const currentRound = (tournament.knockout?.rounds || []).find((round) => round.name === match.stage)
      const nextRound = (tournament.knockout?.rounds || []).find((round) => round.name === nextStage)
      const index = currentRound?.matchIds?.indexOf(match.id) ?? -1
      if (index >= 0 && nextRound?.matchIds?.length) {
        const targetIndex = Math.floor(index / 2)
        const targetId = nextRound.matchIds[targetIndex]
        const target = related.find((item) => item.id === targetId) || getMatch(targetId)
        if (target && (target.home === 'TBD' || target.away === 'TBD' || target.home === 'Bye' || target.away === 'Bye')) {
          const winnerTeam = teams.find((team) => team.name === winner)
          const slot = index % 2 === 0 ? 'home' : 'away'
          const payload =
            slot === 'home'
              ? { home: winner, homeTeamId: winnerTeam?.id || null }
              : { away: winner, awayTeamId: winnerTeam?.id || null }
          if (target[slot] !== winner) {
            updateMatch(targetId, payload)
            nextTournaments = patchTournament(nextTournaments, tournament.id, (item) => item)
            pushNote(nextTournaments, {
              title: 'Team qualifies for knockout stage',
              description: `${winner} advanced to the ${nextStage}.`,
              icon: 'check',
              tournamentId: tournament.id,
              teamId: winnerTeam?.id,
              roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER],
            })
          }
        }
      }
    }

    if (match.stage === 'Final' && winner) {
      const winnerTeam = teams.find((team) => team.name === winner)
      nextTournaments = patchTournament(nextTournaments, tournament.id, (item) => ({
        ...item,
        winner,
        winnerTeamId: winnerTeam?.id || null,
        status: item.status === 'Completed' ? item.status : 'Ongoing',
      }))
      save(nextTournaments)
    }

    if (tournament.format === 'League + Knockout' && leagueStageComplete(tournament, related)) {
      const standings = computeStandings(teams, related, tournament)
      const top = standings.slice(0, 4)
      const sf = related.filter((item) => item.stage === 'Semi Final')
      if (top.length >= 4 && sf.length >= 2 && sf.some((item) => item.home === 'TBD')) {
        const pairs = [
          [top[0], top[3]],
          [top[1], top[2]],
        ]
        sf.slice(0, 2).forEach((item, index) => {
          const [home, away] = pairs[index]
          updateMatch(item.id, {
            home: home.teamName,
            away: away.teamName,
            homeTeamId: home.teamId,
            awayTeamId: away.teamId,
          })
        })
        pushNote(nextTournaments, {
          title: 'Knockout stage populated',
          description: `Top 4 teams have qualified for the knockout stage of ${tournament.name}.`,
          icon: 'tournaments',
          tournamentId: tournament.id,
          roles: [ROLES.ORGANIZER, ROLES.ADMIN, ROLES.CAPTAIN, ROLES.MANAGER, ROLES.PLAYER],
        })
      }
    }

    if (
      tournament.status === 'Fixtures Generated' &&
      related.some((item) => item.status === 'Live' || item.status === 'Completed')
    ) {
      nextTournaments = patchTournament(nextTournaments, tournament.id, (item) => ({
        ...item,
        status: item.status === 'Completed' ? item.status : 'Ongoing',
        round: item.status === 'Completed' ? item.round : 'Ongoing',
      }))
      save(nextTournaments)
    }
  }, [getMatch, getTournament, matches, pushNote, save, teams, tournaments, updateMatch])

  const value = useMemo(
    () => ({
      tournaments,
      notifications,
      getTournament,
      createTournament,
      updateTournament,
      setTournamentStatus,
      registerTeam,
      approveTeam,
      rejectTeam,
      generateFixtures,
      completeTournament,
      advanceFromResult,
    }),
    [
      advanceFromResult,
      approveTeam,
      completeTournament,
      createTournament,
      generateFixtures,
      getTournament,
      notifications,
      registerTeam,
      rejectTeam,
      setTournamentStatus,
      tournaments,
      updateTournament,
    ],
  )

  return <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
}

export function useTournaments() {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournaments must be used within TournamentProvider')
  }
  return context
}

export function notificationForUser(notifications, user, teams) {
  if (!user) return []
  return notifications.filter((item) => {
    if (item.roles?.length && !item.roles.includes(user.role)) return false
    if (item.teamId) {
      const team = teams.find((entry) => entry.id === item.teamId)
      if (!team) return true
      if (user.role === ROLES.ADMIN || user.role === ROLES.ORGANIZER) return true
      if (user.role === ROLES.PLAYER) {
        return team.captain === user.name || Boolean(item.teamId)
      }
      return team.captain === user.name || team.manager === user.name || team.assignedCaptains?.includes(user.name)
    }
    return true
  })
}
