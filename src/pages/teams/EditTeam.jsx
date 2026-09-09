import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import TeamForm from '../../components/teams/TeamForm'
import { useAuth } from '../../context/AuthContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { canArchiveTeam, canEditTeam, getVisibleTeams } from '../../utils/teamAccess'
import { simulateRequest } from '../../utils/helpers'

export default function EditTeam() {
  const { teamId } = useParams()
  const { user } = useAuth()
  const { teams, players, getTeam, updateTeam } = useTeams()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const team = getTeam(teamId)
  const visible = useMemo(
    () => getVisibleTeams(teams, players, user).some((item) => item.id === teamId),
    [players, teamId, teams, user],
  )

  if (!team || !visible) {
    return (
      <EmptyDashboardState
        icon="teams"
        title="This item could not be found."
        description="This team is unavailable or you do not have access."
        actionLabel="Back to Teams"
        to="/teams"
      />
    )
  }

  if (!canEditTeam(team, user)) {
    return (
      <AccessRestricted
        description="You can view this team, but you cannot edit it."
        to={`/teams/${teamId}`}
        actionLabel="View Team"
      />
    )
  }

  const statusOptions = canArchiveTeam(user)
    ? ['Active', 'Inactive', 'Archived']
    : ['Active', 'Inactive']

  async function handleSubmit(values) {
    setSaving(true)
    await simulateRequest(450)
    updateTeam(team.id, values)
    showToast(`${values.name} has been updated.`)
    navigate(`/teams/${team.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/teams/${team.id}`}
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Back to Team
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Edit Team
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Update team details, colours, and status.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <TeamForm
          initialValues={{
            name: team.name,
            location: team.location || team.city,
            shortName: team.shortName,
            type: team.type,
            description: team.description || '',
            status: team.status,
            colors: team.colors || { primary: '#059669', secondary: '#0f172a' },
            logo: team.logo,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          showStatus
          statusOptions={statusOptions}
          saving={saving}
        />
      </div>
    </div>
  )
}
