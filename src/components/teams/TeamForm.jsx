import { useMemo, useState } from 'react'
import AuthField from '../auth/AuthField'
import Icon from '../common/Icons'
import { fieldClass, getFieldClass } from '../../utils/helpers'
import { TEAM_TYPES } from '../../utils/teamAccess'

const EMPTY = {
  name: '',
  location: '',
  shortName: '',
  type: 'Club',
  description: '',
  status: 'Active',
  colors: { primary: '#059669', secondary: '#0f172a' },
  logo: null,
}

export default function TeamForm({
  initialValues,
  onSubmit,
  submitLabel,
  showStatus = false,
  statusOptions = ['Active', 'Inactive', 'Archived'],
  saving = false,
}) {
  const defaults = useMemo(() => ({ ...EMPTY, ...initialValues }), [initialValues])
  const [values, setValues] = useState(defaults)
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handleLogo(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('logo', reader.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Team name is required.'
    if (!values.location.trim()) next.location = 'Location is required.'
    if (!values.shortName.trim()) next.shortName = 'Short name is required.'
    if (!values.type) next.type = 'Team type is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <AuthField id="team-name" label="Team Name" error={errors.name}>
          <input
            id="team-name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            className={getFieldClass(errors.name)}
            placeholder="Mumbai Warriors"
          />
        </AuthField>
        <AuthField id="team-location" label="Team Location" error={errors.location}>
          <input
            id="team-location"
            value={values.location}
            onChange={(event) => update('location', event.target.value)}
            className={getFieldClass(errors.location)}
            placeholder="Mumbai"
          />
        </AuthField>
        <AuthField id="team-short" label="Team Short Name" error={errors.shortName}>
          <input
            id="team-short"
            value={values.shortName}
            maxLength={5}
            onChange={(event) => update('shortName', event.target.value.toUpperCase())}
            className={getFieldClass(errors.shortName)}
            placeholder="MW"
          />
        </AuthField>
        <AuthField id="team-type" label="Team Type" error={errors.type}>
          <select
            id="team-type"
            value={values.type}
            onChange={(event) => update('type', event.target.value)}
            className={getFieldClass(errors.type)}
          >
            {TEAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </AuthField>
      </div>

      <AuthField id="team-description" label="Description">
        <textarea
          id="team-description"
          rows={4}
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
          className={`${fieldClass} min-h-[6.5rem] resize-y`}
          placeholder="Share a short introduction for this team."
        />
      </AuthField>

      {showStatus ? (
        <AuthField id="team-status" label="Status">
          <select
            id="team-status"
            value={values.status}
            onChange={(event) => update('status', event.target.value)}
            className={fieldClass}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </AuthField>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <AuthField id="team-logo" label="Team Logo" hint="Optional. Preview only — files stay in this browser.">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40">
            <Icon name="upload" className="h-4 w-4" />
            <span>{values.logo ? 'Change logo image' : 'Upload a logo image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
          {values.logo ? (
            <img src={values.logo} alt="Team logo preview" className="mt-3 h-16 w-16 rounded-xl object-cover" />
          ) : null}
        </AuthField>
        <div className="grid grid-cols-2 gap-3">
          <AuthField id="color-primary" label="Primary Color">
            <input
              id="color-primary"
              type="color"
              value={values.colors.primary}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  colors: { ...current.colors, primary: event.target.value },
                }))
              }
              className="h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            />
          </AuthField>
          <AuthField id="color-secondary" label="Secondary Color">
            <input
              id="color-secondary"
              type="color"
              value={values.colors.secondary}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  colors: { ...current.colors, secondary: event.target.value },
                }))
              }
              className="h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
            />
          </AuthField>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
