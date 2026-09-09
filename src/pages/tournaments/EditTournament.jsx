import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import AuthField from '../../components/auth/AuthField'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useTournaments } from '../../context/TournamentContext'
import { useToast } from '../../context/ToastContext'
import { FORMAT_OVERS, MATCH_FORMATS } from '../../data/grounds'
import { formatDateKey } from '../../data/matchModel'
import { snapshotGround, TOURNAMENT_FORMATS } from '../../data/tournamentModel'
import { fieldClass, simulateRequest } from '../../utils/helpers'
import { canEditTournament, canViewTournament } from '../../utils/tournamentAccess'

export default function EditTournament() {
  const { tournamentId } = useParams()
  const { user } = useAuth()
  const { getTournament, updateTournament } = useTournaments()
  const { grounds } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const tournament = getTournament(tournamentId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [values, setValues] = useState(() =>
    tournament
      ? {
          name: tournament.name,
          location: tournament.location,
          description: tournament.description || '',
          format: tournament.format,
          maxTeams: tournament.maxTeams,
          matchFormat: tournament.matchFormat,
          overs: tournament.overs,
          startDateKey: tournament.startDateKey,
          endDateKey: tournament.endDateKey,
          defaultGround: tournament.groundIds?.[0] || tournament.defaultGround,
        }
      : {},
  )

  if (!tournament) {
    return (
      <EmptyDashboardState
        icon="tournaments"
        title="Tournament not found"
        description="This tournament is unavailable."
        actionLabel="Back to Tournaments"
        to="/tournaments"
      />
    )
  }

  if (!canViewTournament()) {
    return <AccessRestricted to="/tournaments" actionLabel="Back to Tournaments" />
  }

  if (!canEditTournament(tournament, user)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You cannot edit this tournament."
        to={`/tournaments/${tournament.id}`}
        actionLabel="View Tournament"
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!values.name?.trim()) {
      setError('Tournament name is required.')
      return
    }
    if (!values.location?.trim()) {
      setError('Location is required.')
      return
    }
    if (!values.startDateKey || !values.endDateKey) {
      setError('Tournament dates are required.')
      return
    }
    if (values.endDateKey < values.startDateKey) {
      setError('Tournament end date must be after the start date.')
      return
    }
    setError('')
    setSaving(true)
    await simulateRequest(400)
    const selected =
      grounds.find((item) => item.id === values.defaultGround || item.name === values.defaultGround) ||
      grounds.find((item) => item.name === tournament.defaultGround)
    updateTournament(tournament.id, {
      ...values,
      startDate: formatDateKey(values.startDateKey),
      endDate: formatDateKey(values.endDateKey),
      defaultGround: selected?.name || values.defaultGround,
      groundIds: selected
        ? Array.from(new Set([selected.id, ...(tournament.groundIds || []).filter((id) => id !== selected.id)]))
        : tournament.groundIds,
      grounds: selected
        ? [snapshotGround(selected), ...(tournament.grounds || []).filter((item) => item.id !== selected.id)]
        : tournament.grounds,
    })
    showToast('Tournament details updated.')
    navigate(`/tournaments/${tournament.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to={`/tournaments/${tournament.id}`} className="text-sm font-semibold text-emerald-700">
          Back to Tournament
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Edit Tournament</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <AuthField id="en" label="Tournament Name">
          <input id="en" className={fieldClass} value={values.name} onChange={(event) => setValues((c) => ({ ...c, name: event.target.value }))} />
        </AuthField>
        <AuthField id="el" label="Location">
          <input id="el" className={fieldClass} value={values.location} onChange={(event) => setValues((c) => ({ ...c, location: event.target.value }))} />
        </AuthField>
        <AuthField id="ef" label="Format">
          <select id="ef" className={fieldClass} value={values.format} onChange={(event) => setValues((c) => ({ ...c, format: event.target.value }))}>
            {TOURNAMENT_FORMATS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </AuthField>
        <AuthField id="em" label="Match Format">
          <select
            id="em"
            className={fieldClass}
            value={values.matchFormat}
            onChange={(event) =>
              setValues((c) => ({ ...c, matchFormat: event.target.value, overs: FORMAT_OVERS[event.target.value] || c.overs }))
            }
          >
            {MATCH_FORMATS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </AuthField>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField id="esd" label="Start Date">
            <input
              id="esd"
              type="date"
              className={fieldClass}
              value={values.startDateKey || ''}
              onChange={(event) => setValues((c) => ({ ...c, startDateKey: event.target.value }))}
            />
          </AuthField>
          <AuthField id="eed" label="End Date">
            <input
              id="eed"
              type="date"
              className={fieldClass}
              value={values.endDateKey || ''}
              onChange={(event) => setValues((c) => ({ ...c, endDateKey: event.target.value }))}
            />
          </AuthField>
        </div>
        <AuthField id="eg" label="Default Ground">
          <select
            id="eg"
            className={fieldClass}
            value={values.defaultGround}
            onChange={(event) => setValues((c) => ({ ...c, defaultGround: event.target.value }))}
          >
            {grounds
              .filter((item) => item.status !== 'Under Maintenance')
              .map((ground) => (
                <option key={ground.id} value={ground.id}>
                  {ground.name}
                </option>
              ))}
          </select>
        </AuthField>
        <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
