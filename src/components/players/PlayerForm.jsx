import { useMemo, useState } from 'react'
import AuthField from '../auth/AuthField'
import Icon from '../common/Icons'
import { fieldClass, getFieldClass, isValidEmail, isValidMobile } from '../../utils/helpers'
import { PLAYING_POSITIONS } from '../../utils/teamAccess'
import { BATTING_STYLES, BOWLING_STYLES } from '../../utils/playerAccess'

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  location: '',
  position: 'Batsman',
  battingStyle: 'Right-hand bat',
  bowlingStyle: 'Right-arm medium',
  teamId: '',
  avatar: null,
}

export default function PlayerForm({
  initialValues,
  onSubmit,
  submitLabel,
  saving = false,
  teams = [],
  showTeam = true,
  lockedFields = [],
}) {
  const defaults = useMemo(() => ({ ...EMPTY, ...initialValues }), [initialValues])
  const [values, setValues] = useState(defaults)
  const [errors, setErrors] = useState({})

  function locked(field) {
    return lockedFields.includes(field)
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('avatar', reader.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const next = {}
    if (!values.name.trim()) next.name = 'Full name is required.'
    if (values.email.trim() && !isValidEmail(values.email)) {
      next.email = 'Enter a valid email address.'
    }
    if (values.phone.trim() && !isValidMobile(values.phone)) {
      next.phone = 'Enter a valid 10-digit mobile number.'
    }
    if (!values.position) next.position = 'Playing role is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Personal Information
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <AuthField id="player-name" label="Full Name" error={errors.name}>
            <input
              id="player-name"
              value={values.name}
              disabled={locked('name')}
              onChange={(event) => update('name', event.target.value)}
              className={getFieldClass(errors.name)}
              placeholder="Rohit Patel"
            />
          </AuthField>
          <AuthField id="player-email" label="Email" error={errors.email}>
            <input
              id="player-email"
              type="email"
              value={values.email}
              disabled={locked('email')}
              onChange={(event) => update('email', event.target.value)}
              className={getFieldClass(errors.email)}
              placeholder="rohit@myinnings.demo"
            />
          </AuthField>
          <AuthField id="player-phone" label="Phone Number" error={errors.phone}>
            <input
              id="player-phone"
              value={values.phone}
              disabled={locked('phone')}
              onChange={(event) => update('phone', event.target.value)}
              className={getFieldClass(errors.phone)}
              placeholder="+91 98765 43210"
            />
          </AuthField>
          <AuthField id="player-location" label="Location">
            <input
              id="player-location"
              value={values.location}
              disabled={locked('location')}
              onChange={(event) => update('location', event.target.value)}
              className={fieldClass}
              placeholder="Mumbai"
            />
          </AuthField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Cricket Information
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <AuthField id="player-role" label="Playing Role" error={errors.position}>
            <select
              id="player-role"
              value={values.position}
              disabled={locked('position')}
              onChange={(event) => update('position', event.target.value)}
              className={getFieldClass(errors.position)}
            >
              {PLAYING_POSITIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </AuthField>
          <AuthField id="player-bat" label="Batting Style">
            <select
              id="player-bat"
              value={values.battingStyle}
              disabled={locked('battingStyle')}
              onChange={(event) => update('battingStyle', event.target.value)}
              className={fieldClass}
            >
              {BATTING_STYLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </AuthField>
          <AuthField id="player-bowl" label="Bowling Style">
            <select
              id="player-bowl"
              value={values.bowlingStyle}
              disabled={locked('bowlingStyle')}
              onChange={(event) => update('bowlingStyle', event.target.value)}
              className={fieldClass}
            >
              {BOWLING_STYLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </AuthField>
        </div>
      </section>

      {showTeam ? (
        <AuthField id="player-team" label="Select Team">
          <select
            id="player-team"
            value={values.teamId || ''}
            disabled={locked('teamId')}
            onChange={(event) => update('teamId', event.target.value)}
            className={fieldClass}
          >
            <option value="">Unassigned</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </AuthField>
      ) : null}

      <AuthField
        id="player-photo"
        label="Profile Photo"
        hint="Optional. Preview only — files stay in this browser."
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40">
          <Icon name="upload" className="h-4 w-4" />
          <span>{values.avatar ? 'Change profile photo' : 'Upload a profile photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>
        {values.avatar ? (
          <img src={values.avatar} alt="Profile preview" className="mt-3 h-16 w-16 rounded-full object-cover" />
        ) : null}
      </AuthField>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
