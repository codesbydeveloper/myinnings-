import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import PlayerForm from '../../components/players/PlayerForm'
import { useAuth } from '../../context/AuthContext'
import { usePlayers } from '../../context/PlayerContext'
import { useToast } from '../../context/ToastContext'
import { ROLES } from '../../utils/constants'
import { canCreatePlayer } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'
import { simulateRequest } from '../../utils/helpers'

export default function CreatePlayer() {
  const { user } = useAuth()
  const { createPlayer, teams, players } = usePlayers()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const assignableTeams = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return teams
    return getVisibleTeams(teams, players, user)
  }, [players, teams, user])

  if (!canCreatePlayer(user?.role)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to add players."
        to="/players"
        actionLabel="Back to Players"
      />
    )
  }

  async function handleSubmit(values) {
    if (user.role === ROLES.CAPTAIN && !values.teamId) {
      setError('Select one of your teams for this player.')
      return
    }
    setError('')
    setSaving(true)
    await simulateRequest(450)
    const player = createPlayer(values, user)
    showToast(`${player.name} has been added.`)
    navigate(`/players/${player.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/players" className="text-sm font-semibold text-emerald-700">
          Back to Players
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Add Player
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a player profile and optionally assign them to a team.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <PlayerForm
          onSubmit={handleSubmit}
          submitLabel="Add Player"
          saving={saving}
          teams={assignableTeams}
        />
      </div>
    </div>
  )
}
