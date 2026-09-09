/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { decoratePlayer, SEED_PLAYERS } from '../data/players'
import { TEAMS } from '../data/teams'
import { AUTH_STORAGE_KEYS, ROLES } from '../utils/constants'
import { createId, formatDisplayDate } from '../utils/helpers'
import { emitActivity, emitNotification } from '../utils/inbox'
import { readJson, writeJson } from '../utils/storage'

const TeamContext = createContext(null)

function persist(teams, players) {
  writeJson(AUTH_STORAGE_KEYS.teamStore, { teams, players })
}

function loadStore() {
  const stored = readJson(AUTH_STORAGE_KEYS.teamStore, null)
  if (stored?.teams?.length && stored?.players?.length) {
    return {
      teams: stored.teams,
      players: stored.players.map((player, index) => decoratePlayer(player, index)),
    }
  }
  return {
    teams: TEAMS.map((team) => ({ ...team })),
    players: SEED_PLAYERS.map((player) => ({ ...player })),
  }
}

function withDerived(teams, players) {
  return teams.map((team) => {
    const roster = players.filter((player) => player.teamId === team.id)
    const captain = roster.find((player) => player.teamRole === 'Captain')
    const viceCaptain = roster.find((player) => player.teamRole === 'Vice Captain')

    return {
      ...team,
      location: team.location || team.city,
      city: team.city || team.location,
      players: roster.length,
      available: roster.filter((player) => player.availability === 'Available').length,
      captain: captain?.name || team.captain || 'Unassigned',
      viceCaptain: viceCaptain?.name || team.viceCaptain || '',
    }
  })
}

function clearTeamRole(players, teamId, role, exceptId) {
  return players.map((player) => {
    if (player.teamId !== teamId || player.id === exceptId || player.teamRole !== role) {
      return player
    }
    return { ...player, teamRole: 'Player' }
  })
}

export function TeamProvider({ children }) {
  const [{ teams, players }, setStore] = useState(loadStore)

  const save = useCallback((nextTeams, nextPlayers) => {
    persist(nextTeams, nextPlayers)
    setStore({ teams: nextTeams, players: nextPlayers })
  }, [])

  const createTeam = useCallback((payload, user) => {
    const id = createId('team')
    const team = {
      id,
      name: payload.name.trim(),
      shortName: payload.shortName.trim().toUpperCase(),
      city: payload.location.trim(),
      location: payload.location.trim(),
      type: payload.type,
      description: payload.description?.trim() || '',
      captain: '',
      manager: user?.role === ROLES.MANAGER ? user.name : payload.manager || '',
      assignedCaptains: user?.role === ROLES.CAPTAIN ? [user.name] : [],
      players: 0,
      available: 0,
      status: payload.status || 'Active',
      createdDate: formatDisplayDate(new Date()),
      colors: payload.colors || { primary: '#059669', secondary: '#0f172a' },
      logo: payload.logo || null,
      stats: { played: 0, wins: 0, losses: 0, draws: 0 },
    }

    const nextTeams = [team, ...teams]
    save(nextTeams, players)
    emitNotification({
      title: 'New team created',
      message: `${team.name} was added to MyInnings.`,
      type: 'system',
      category: 'Team',
      relatedEntityType: 'team',
      relatedEntityId: team.id,
      route: `/teams/${team.id}`,
      roles: [ROLES.ADMIN],
      includeAdmin: true,
      currentUserId: user?.id,
      actorName: user?.name,
    })
    emitActivity({
      title: 'Team created',
      description: `${user?.name || 'A user'} created ${team.name}.`,
      category: 'Team Activity',
      relatedEntityType: 'team',
      relatedEntityId: team.id,
      route: `/teams/${team.id}`,
      actorName: user?.name,
      actorId: user?.id,
      teamId: team.id,
    })
    return team
  }, [players, save, teams])

  const updateTeam = useCallback((teamId, payload) => {
    let nextName = null
    const nextTeams = teams.map((team) => {
      if (team.id !== teamId) return team
      const location = (payload.location ?? payload.city ?? team.location).trim()
      nextName = payload.name?.trim() ?? team.name
      return {
        ...team,
        ...payload,
        name: nextName,
        shortName: payload.shortName?.trim().toUpperCase() ?? team.shortName,
        location,
        city: location,
        description: payload.description?.trim() ?? team.description,
      }
    })
    const nextPlayers = nextName
      ? players.map((player) =>
          player.teamId === teamId
            ? { ...player, teamName: nextName, team: nextName }
            : player,
        )
      : players
    save(nextTeams, nextPlayers)
  }, [players, save, teams])

  const setTeamStatus = useCallback((teamId, status) => {
    const nextTeams = teams.map((team) =>
      team.id === teamId ? { ...team, status } : team,
    )
    save(nextTeams, players)
  }, [players, save, teams])

  const addPlayersToTeam = useCallback((teamId, playerIds) => {
    const team = teams.find((item) => item.id === teamId)
    if (!team) return

    const selected = new Set(playerIds)
    const nextPlayers = players.map((player) => {
      if (!selected.has(player.id)) return player
      return {
        ...player,
        teamId,
        teamName: team.name,
        team: team.name,
        teamRole: player.teamId === teamId ? player.teamRole : 'Player',
      }
    })

    const nextTeams = teams.map((item) => {
      const captain = nextPlayers.find(
        (player) => player.teamId === item.id && player.teamRole === 'Captain',
      )
      return { ...item, captain: captain?.name || '' }
    })

    save(nextTeams, nextPlayers)
  }, [players, save, teams])

  const removePlayerFromTeam = useCallback((teamId, playerId) => {
    const nextPlayers = players.map((player) => {
      if (player.id !== playerId || player.teamId !== teamId) return player
      return {
        ...player,
        teamId: null,
        teamName: '',
        team: '',
        teamRole: 'Player',
      }
    })

    const nextTeams = teams.map((team) => {
      if (team.id !== teamId) return team
      const roster = nextPlayers.filter((player) => player.teamId === team.id)
      const captain = roster.find((player) => player.teamRole === 'Captain')
      return {
        ...team,
        captain: captain?.name || '',
      }
    })

    save(nextTeams, nextPlayers)
  }, [players, save, teams])

  const updatePlayerOnTeam = useCallback((teamId, playerId, patch) => {
    let nextPlayers = players.map((player) => {
      if (player.id !== playerId || player.teamId !== teamId) return player
      return { ...player, ...patch }
    })

    if (patch.teamRole === 'Captain') {
      nextPlayers = clearTeamRole(nextPlayers, teamId, 'Captain', playerId)
    }

    if (patch.teamRole === 'Vice Captain') {
      nextPlayers = clearTeamRole(nextPlayers, teamId, 'Vice Captain', playerId)
      nextPlayers = nextPlayers.map((player) =>
        player.id === playerId && player.teamId === teamId
          ? { ...player, teamRole: 'Vice Captain' }
          : player,
      )
    }

    const nextTeams = teams.map((team) => {
      if (team.id !== teamId) return team
      const captain = nextPlayers.find(
        (player) => player.teamId === teamId && player.teamRole === 'Captain',
      )
      const viceCaptain = nextPlayers.find(
        (player) => player.teamId === teamId && player.teamRole === 'Vice Captain',
      )
      return {
        ...team,
        captain: captain?.name || '',
        viceCaptain: viceCaptain?.name || '',
      }
    })

    save(nextTeams, nextPlayers)
  }, [players, save, teams])

  const derivedTeams = useMemo(() => withDerived(teams, players), [players, teams])

  const getTeam = useCallback(
    (teamId) => derivedTeams.find((team) => team.id === teamId) ?? null,
    [derivedTeams],
  )

  const getTeamPlayers = useCallback(
    (teamId) =>
      players
        .filter((player) => player.teamId === teamId)
        .slice()
        .sort((a, b) => {
          const rank = { Captain: 0, 'Vice Captain': 1, Player: 2 }
          return (rank[a.teamRole] ?? 3) - (rank[b.teamRole] ?? 3) || a.name.localeCompare(b.name)
        }),
    [players],
  )

  const getEligiblePlayers = useCallback(
    (teamId) =>
      players
        .filter((player) => player.teamId !== teamId)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    [players],
  )

  const getPlayer = useCallback(
    (playerId) => players.find((player) => player.id === playerId) ?? null,
    [players],
  )

  const createPlayer = useCallback((payload, user) => {
    const team = payload.teamId ? teams.find((item) => item.id === payload.teamId) : null
    const id = createId('player')
    const player = decoratePlayer({
      id,
      name: payload.name.trim(),
      email: payload.email?.trim() || '',
      phone: payload.phone?.trim() || '',
      location: payload.location?.trim() || team?.location || '',
      position: payload.position,
      role: payload.position,
      battingStyle: payload.battingStyle || 'Right-hand bat',
      bowlingStyle: payload.bowlingStyle || 'Right-arm medium',
      teamId: team?.id || null,
      teamName: team?.name || '',
      team: team?.name || '',
      teamRole: 'Player',
      availability: 'Pending',
      paymentStatus: 'Paid',
      dues: 0,
      status: 'Active',
      joinedDate: team
        ? new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '',
      avatar: payload.avatar || null,
      previousTeams: [],
      availabilityByMatch: {},
      stats: { played: 0, won: 0, runs: 0, highest: 0, average: 0, wickets: 0, bestFigures: '-' },
      payments: [],
    })

    if (user?.role === ROLES.MANAGER && !player.email) {
      player.email = `${player.name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@myinnings.demo`
    }

    const nextPlayers = [player, ...players]
    save(teams, nextPlayers)
    return player
  }, [players, save, teams])

  const updatePlayer = useCallback((playerId, payload) => {
    const current = players.find((player) => player.id === playerId)
    if (!current) return

    const nextTeamId = payload.teamId === undefined ? current.teamId : payload.teamId || null
    const team = nextTeamId ? teams.find((item) => item.id === nextTeamId) : null
    const moved = nextTeamId !== current.teamId

    const nextPlayers = players.map((player) => {
      if (player.id !== playerId) return player
      const name = payload.name?.trim() ?? player.name
      return {
        ...player,
        ...payload,
        name,
        location: payload.location?.trim() ?? player.location,
        email: payload.email?.trim() ?? player.email,
        phone: payload.phone?.trim() ?? player.phone,
        position: payload.position ?? player.position,
        role: payload.position ?? player.role,
        battingStyle: payload.battingStyle ?? player.battingStyle,
        bowlingStyle: payload.bowlingStyle ?? player.bowlingStyle,
        avatar: payload.avatar === undefined ? player.avatar : payload.avatar,
        teamId: nextTeamId,
        teamName: team?.name || '',
        team: team?.name || '',
        teamRole: moved ? 'Player' : player.teamRole,
        joinedDate:
          moved && team
            ? new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : player.joinedDate,
        previousTeams:
          moved && current.teamId
            ? [
                {
                  id: current.teamId,
                  name: current.teamName,
                  location: teams.find((item) => item.id === current.teamId)?.location || '',
                  joinedDate: current.joinedDate,
                  leftDate: new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                  status: 'Former',
                },
                ...(player.previousTeams || []),
              ]
            : player.previousTeams,
      }
    })

    const nextTeams = teams.map((item) => {
      const captain = nextPlayers.find(
        (player) => player.teamId === item.id && player.teamRole === 'Captain',
      )
      return { ...item, captain: captain?.name || '' }
    })

    save(nextTeams, nextPlayers)
  }, [players, save, teams])

  const setPlayerStatus = useCallback((playerId, status) => {
    const nextPlayers = players.map((player) =>
      player.id === playerId ? { ...player, status } : player,
    )
    save(teams, nextPlayers)
  }, [players, save, teams])

  const setPlayerAvailability = useCallback((playerId, matchId, status) => {
    const nextPlayers = players.map((player) => {
      if (player.id !== playerId) return player
      return {
        ...player,
        availability: status,
        availabilityByMatch: {
          ...(player.availabilityByMatch || {}),
          ...(matchId ? { [matchId]: status } : {}),
        },
      }
    })
    save(teams, nextPlayers)
  }, [players, save, teams])

  const value = useMemo(
    () => ({
      teams: derivedTeams,
      players,
      createTeam,
      updateTeam,
      setTeamStatus,
      addPlayersToTeam,
      removePlayerFromTeam,
      updatePlayerOnTeam,
      getTeam,
      getTeamPlayers,
      getEligiblePlayers,
      getPlayer,
      createPlayer,
      updatePlayer,
      setPlayerStatus,
      setPlayerAvailability,
    }),
    [
      addPlayersToTeam,
      createPlayer,
      createTeam,
      derivedTeams,
      getEligiblePlayers,
      getPlayer,
      getTeam,
      getTeamPlayers,
      players,
      removePlayerFromTeam,
      setPlayerAvailability,
      setPlayerStatus,
      setTeamStatus,
      updatePlayer,
      updatePlayerOnTeam,
      updateTeam,
    ],
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeams() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeams must be used within TeamProvider')
  }
  return context
}
