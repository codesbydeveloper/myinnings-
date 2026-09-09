import { useTeams } from './TeamContext'

export function usePlayers() {
  const club = useTeams()

  return {
    players: club.players,
    teams: club.teams,
    getPlayer: club.getPlayer,
    createPlayer: club.createPlayer,
    updatePlayer: club.updatePlayer,
    setPlayerStatus: club.setPlayerStatus,
    setPlayerAvailability: club.setPlayerAvailability,
    addPlayersToTeam: club.addPlayersToTeam,
    removePlayerFromTeam: club.removePlayerFromTeam,
    getTeam: club.getTeam,
  }
}
