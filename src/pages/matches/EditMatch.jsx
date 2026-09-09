import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import AuthField from '../../components/auth/AuthField'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { FORMAT_OVERS, MATCH_FORMATS } from '../../data/grounds'
import { durationForFormat, parseTimeToMinutes, toInputTime } from '../../data/groundModel'
import { formatDateKey } from '../../data/matchModel'
import { fieldClass, simulateRequest } from '../../utils/helpers'
import { canEditMatch, canViewMatch } from '../../utils/matchAccess'

export default function EditMatch() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { getMatch, updateMatch } = useMatches()
  const { grounds, bookings, checkAvailability, syncMatchBooking, availabilityOf } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const match = getMatch(matchId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState(() =>
    match
      ? {
          dateKey: match.dateKey,
          time: match.time,
          format: match.format,
          overs: match.overs,
          title: match.title || '',
          description: match.description || '',
          groundId: match.groundId || match.ground?.id,
        }
      : {},
  )

  if (!match) {
    return (
      <EmptyDashboardState
        icon="matches"
        title="Match not found"
        description="This match is unavailable or you do not have access."
        actionLabel="Back to Matches"
        to="/matches"
      />
    )
  }

  if (!canViewMatch(match, user, teams, players)) {
    return <AccessRestricted to="/matches" actionLabel="Back to Matches" />
  }

  if (!canEditMatch(match, user, teams)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You cannot edit this match."
        to={`/matches/${match.id}`}
        actionLabel="View Match"
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!values.dateKey) {
      setError('Match date cannot be empty.')
      return
    }
    if (!values.time?.trim()) {
      setError('Match time is required.')
      return
    }
    const ground = grounds.find((item) => item.id === values.groundId) || match.ground
    const existing = bookings.find((item) => item.matchId === match.id && item.status !== 'Cancelled')
    const start = parseTimeToMinutes(values.time) ?? 10 * 60
    const check = checkAvailability(
      {
        groundId: ground?.id,
        dateKey: values.dateKey,
        startTime: toInputTime(start),
        endTime: toInputTime(start + durationForFormat(values.format)),
      },
      existing?.id,
    )
    if (!check.available) {
      setError(check.message)
      return
    }
    setSaving(true)
    await simulateRequest(400)
    const updated = updateMatch(match.id, {
      dateKey: values.dateKey,
      date: formatDateKey(values.dateKey),
      time: values.time,
      format: values.format,
      overs: values.overs,
      title: values.title,
      description: values.description,
      ground,
      groundId: ground?.id,
      venue: ground?.name,
    })
    setSaving(false)
    if (!updated) {
      setError('You do not have permission to update this match.')
      return
    }
    syncMatchBooking(updated)
    showToast('Match details updated.')
    navigate(`/matches/${match.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to={`/matches/${match.id}`} className="text-sm font-semibold text-emerald-700">
          Back to Match
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Edit Match</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <AuthField id="edit-date" label="Match Date">
          <input
            id="edit-date"
            type="date"
            className={fieldClass}
            value={values.dateKey}
            onChange={(event) => setValues((current) => ({ ...current, dateKey: event.target.value }))}
          />
        </AuthField>
        <AuthField id="edit-time" label="Match Time">
          <input
            id="edit-time"
            className={fieldClass}
            value={values.time}
            onChange={(event) => setValues((current) => ({ ...current, time: event.target.value }))}
          />
        </AuthField>
        <AuthField id="edit-format" label="Format">
          <select
            id="edit-format"
            className={fieldClass}
            value={values.format}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                format: event.target.value,
                overs: FORMAT_OVERS[event.target.value] || current.overs,
              }))
            }
          >
            {MATCH_FORMATS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </AuthField>
        <AuthField id="edit-overs" label="Overs">
          <input
            id="edit-overs"
            type="number"
            className={fieldClass}
            value={values.overs}
            onChange={(event) => setValues((current) => ({ ...current, overs: Number(event.target.value) }))}
          />
        </AuthField>
        <AuthField id="edit-ground" label="Ground">
          <select
            id="edit-ground"
            className={fieldClass}
            value={values.groundId}
            onChange={(event) => {
              setError('')
              setValues((current) => ({ ...current, groundId: event.target.value }))
            }}
          >
            {grounds.map((ground) => (
              <option key={ground.id} value={ground.id} disabled={ground.status === 'Under Maintenance'}>
                {ground.name} · {availabilityOf(ground)}
              </option>
            ))}
          </select>
        </AuthField>
        <AuthField id="edit-title" label="Title">
          <input
            id="edit-title"
            className={fieldClass}
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          />
        </AuthField>
        <AuthField id="edit-desc" label="Description">
          <textarea
            id="edit-desc"
            rows={3}
            className={fieldClass}
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          />
        </AuthField>
        <button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
