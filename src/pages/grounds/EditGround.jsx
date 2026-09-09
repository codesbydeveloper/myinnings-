import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import GroundForm from '../../components/grounds/GroundForm'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useToast } from '../../context/ToastContext'
import { simulateRequest } from '../../utils/helpers'
import { canEditGround } from '../../utils/groundAccess'

export default function EditGround() {
  const { groundId } = useParams()
  const { user } = useAuth()
  const { getGround, updateGround } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const ground = getGround(groundId)

  if (!canEditGround(user)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="Only a Platform Admin can edit grounds."
        to="/grounds"
        actionLabel="Back to Grounds"
      />
    )
  }

  if (!ground) {
    return (
      <EmptyDashboardState
        icon="grounds"
        title="Ground not found"
        description="This venue is unavailable."
        actionLabel="Back to Grounds"
        to="/grounds"
      />
    )
  }

  async function handleSubmit(payload) {
    setSaving(true)
    await simulateRequest(350)
    updateGround(ground.id, payload)
    setSaving(false)
    showToast('Ground updated.')
    navigate(`/grounds/${ground.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to={`/grounds/${ground.id}`} className="text-sm font-semibold text-emerald-700">
          Back to Ground
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Edit Ground</h1>
      </div>
      <GroundForm initial={ground} onSubmit={handleSubmit} saving={saving} submitLabel="Save Changes" />
    </div>
  )
}
