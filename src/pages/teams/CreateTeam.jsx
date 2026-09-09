import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import TeamForm from '../../components/teams/TeamForm'
import { useAuth } from '../../context/AuthContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { canCreateTeam } from '../../utils/teamAccess'
import { simulateRequest } from '../../utils/helpers'

export default function CreateTeam() {
  const { user } = useAuth()
  const { createTeam } = useTeams()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  if (!canCreateTeam(user?.role)) {
    return (
      <AccessRestricted
        description="Only team managers and platform admins can create teams."
        to="/teams"
        actionLabel="Back to Teams"
      />
    )
  }

  async function handleSubmit(values) {
    setSaving(true)
    await simulateRequest(500)
    const team = createTeam(values, user)
    showToast('Team created successfully.')
    navigate(`/teams/${team.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/teams" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to Teams
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Create Team
        </h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Add a new cricket team and start building the squad.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <TeamForm onSubmit={handleSubmit} submitLabel="Create Team" saving={saving} />
      </div>
    </div>
  )
}
