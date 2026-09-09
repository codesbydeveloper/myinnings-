import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import PlayerForm from '../../components/players/PlayerForm'
import { useAuth } from '../../context/AuthContext'
import { usePlayers } from '../../context/PlayerContext'
import { useToast } from '../../context/ToastContext'
import { ROLES } from '../../utils/constants'
import { canAssignPlayerTeam, canEditPlayer, canViewPlayer } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'
import { simulateRequest } from '../../utils/helpers'

export default function EditPlayer() {
  const { playerId } = useParams()
  const { user } = useAuth()
  const { players, teams, getPlayer, updatePlayer } = usePlayers()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const player = getPlayer(playerId)
  const visible = player ? canViewPlayer(player, user, teams, players) : false
  const canEdit = player ? canEditPlayer(player, user, teams) : false

  const assignableTeams = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return teams
    return getVisibleTeams(teams, players, user)
  }, [players, teams, user])

  if (!player || !visible) {
    return (
      <EmptyDashboardState
        icon="players"
        title="Player not found"
        description="This player is unavailable or you do not have access."
        actionLabel="Back to Players"
        to="/players"
      />
    )
  }

  if (!canEdit) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You cannot edit this player profile."
        to={`/players/${player.id}`}
        actionLabel="View Profile"
      />
    )
  }

  const isOwnPlayer = user?.role === ROLES.PLAYER && player.name === user.name
  const showTeam = canAssignPlayerTeam(user) && !isOwnPlayer
  const lockedFields = isOwnPlayer ? ['position', 'teamId'] : []

  async function handleSubmit(values) {
    setSaving(true)
    await simulateRequest(400)
    updatePlayer(player.id, values)
    showToast(`${values.name} has been updated.`)
    navigate(`/players/${player.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to={`/players/${player.id}`} className="text-sm font-semibold text-emerald-700">
          Back to Profile
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Edit Player
        </h1>
        <p className="mt-2 text-sm text-slate-500">Update profile details and cricket information.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <PlayerForm
          initialValues={{
            name: player.name,
            email: player.email || '',
            phone: player.phone || '',
            location: player.location || '',
            position: player.position,
            battingStyle: player.battingStyle,
            bowlingStyle: player.bowlingStyle,
            teamId: player.teamId || '',
            avatar: player.avatar,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          saving={saving}
          teams={assignableTeams}
          showTeam={showTeam}
          lockedFields={lockedFields}
        />
      </div>
    </div>
  )
}
