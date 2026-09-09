import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import GroundForm from '../../components/grounds/GroundForm'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useToast } from '../../context/ToastContext'
import { simulateRequest } from '../../utils/helpers'
import { canCreateGround } from '../../utils/groundAccess'

export default function CreateGround() {
  const { user } = useAuth()
  const { addGround } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  if (!canCreateGround(user?.role)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="Only a Platform Admin can add grounds."
        to="/grounds"
        actionLabel="Back to Grounds"
      />
    )
  }

  async function handleSubmit(payload) {
    setSaving(true)
    await simulateRequest(350)
    const ground = addGround(payload)
    setSaving(false)
    if (!ground) {
      showToast('You do not have permission to add a ground.', 'error')
      return
    }
    showToast('Ground added successfully.')
    navigate(`/grounds/${ground.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/grounds" className="text-sm font-semibold text-emerald-700">
          Back to Grounds
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Add Ground</h1>
        <p className="mt-2 text-sm text-slate-500">Create a venue record for this frontend prototype.</p>
      </div>
      <GroundForm onSubmit={handleSubmit} saving={saving} submitLabel="Save Ground" />
    </div>
  )
}
