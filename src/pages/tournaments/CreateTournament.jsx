import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import AuthField from '../../components/auth/AuthField'
import WizardSteps from '../../components/matches/WizardSteps'
import TournamentLogo from '../../components/tournaments/TournamentLogo'
import { useAuth } from '../../context/AuthContext'
import { useGrounds } from '../../context/GroundContext'
import { useTournaments } from '../../context/TournamentContext'
import { useToast } from '../../context/ToastContext'
import { FORMAT_OVERS, MATCH_FORMATS } from '../../data/grounds'
import { snapshotGround, TOURNAMENT_FORMATS } from '../../data/tournamentModel'
import { formatDateKey } from '../../data/matchModel'
import { fieldClass, simulateRequest } from '../../utils/helpers'
import { canCreateTournament } from '../../utils/tournamentAccess'

const STEPS = ['Basic info', 'Format', 'Teams', 'Matches', 'Schedule', 'Review']

const EMPTY = {
  name: '',
  location: '',
  description: '',
  logo: null,
  format: 'League + Knockout',
  minTeams: 4,
  maxTeams: 12,
  registrationFee: 5000,
  registrationStartKey: '',
  registrationEndKey: '',
  matchFormat: 'T20',
  overs: 20,
  matchDuration: '3 hours',
  startDateKey: '',
  endDateKey: '',
  defaultGround: '',
}

export default function CreateTournament() {
  const { user } = useAuth()
  const { createTournament } = useTournaments()
  const { grounds } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!canCreateTournament(user?.role)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to create tournaments."
        to="/tournaments"
        actionLabel="Back to Tournaments"
      />
    )
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function handleLogo(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('logo', reader.result)
    reader.readAsDataURL(file)
  }

  function validateStep() {
    if (step === 0) {
      if (!values.name.trim()) return 'Tournament name is required.'
      if (!values.location.trim()) return 'Location is required.'
    }
    if (step === 1 && !values.format) return 'Select a tournament format.'
    if (step === 2) {
      if (Number(values.minTeams) < 2) return 'Minimum teams must be at least 2.'
      if (Number(values.maxTeams) < Number(values.minTeams)) return 'Maximum teams must be greater than minimum teams.'
      if (!values.registrationStartKey || !values.registrationEndKey) return 'Registration dates are required.'
      if (values.registrationEndKey < values.registrationStartKey) {
        return 'Registration end date must be after the start date.'
      }
    }
    if (step === 4) {
      if (!values.startDateKey || !values.endDateKey) return 'Tournament dates are required.'
      if (values.endDateKey < values.startDateKey) {
        return 'Tournament end date must be after the start date.'
      }
    }
    return ''
  }

  function next() {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    setStep((value) => Math.min(value + 1, STEPS.length - 1))
  }

  async function handleCreate() {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    setSaving(true)
    await simulateRequest(500)
    const selected =
      grounds.find((item) => item.id === values.defaultGround || item.name === values.defaultGround) ||
      grounds.find((item) => item.status !== 'Under Maintenance')
    const tournament = createTournament({
      ...values,
      registrationStart: formatDateKey(values.registrationStartKey),
      registrationEnd: formatDateKey(values.registrationEndKey),
      startDate: formatDateKey(values.startDateKey),
      endDate: formatDateKey(values.endDateKey),
      defaultGround: selected?.name || values.defaultGround,
      groundIds: selected ? [selected.id] : [],
      grounds: selected ? [snapshotGround(selected)] : [],
    })
    setSaving(false)
    if (!tournament) {
      setError('You do not have permission to create this tournament.')
      return
    }
    showToast('Tournament created successfully.')
    navigate(`/tournaments/${tournament.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/tournaments" className="text-sm font-semibold text-emerald-700">
          Back to Tournaments
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Create Tournament
        </h1>
        <p className="mt-2 text-sm text-slate-500">Set up a cricket tournament and open team registration.</p>
      </div>
      <WizardSteps steps={STEPS} current={step} onSelect={setStep} />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField id="t-name" label="Tournament Name">
              <input id="t-name" className={fieldClass} value={values.name} onChange={(event) => update('name', event.target.value)} />
            </AuthField>
            <AuthField id="t-loc" label="Location">
              <input id="t-loc" className={fieldClass} value={values.location} onChange={(event) => update('location', event.target.value)} placeholder="Mumbai, India" />
            </AuthField>
            <div className="md:col-span-2">
              <AuthField id="t-desc" label="Tournament Description">
                <textarea id="t-desc" rows={3} className={fieldClass} value={values.description} onChange={(event) => update('description', event.target.value)} />
              </AuthField>
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
              <TournamentLogo tournament={values} size="lg" />
              <label className="text-sm font-semibold text-emerald-700">
                Upload logo
                <input type="file" accept="image/*" className="sr-only" onChange={handleLogo} />
              </label>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {TOURNAMENT_FORMATS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => update('format', item)}
                className={`min-h-24 rounded-2xl border p-4 text-left font-semibold ${
                  values.format === item ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-800'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField id="min-t" label="Minimum Teams">
              <input id="min-t" type="number" min="2" className={fieldClass} value={values.minTeams} onChange={(event) => update('minTeams', Number(event.target.value))} />
            </AuthField>
            <AuthField id="max-t" label="Maximum Teams">
              <input id="max-t" type="number" min="2" className={fieldClass} value={values.maxTeams} onChange={(event) => update('maxTeams', Number(event.target.value))} />
            </AuthField>
            <AuthField id="fee" label="Team Registration Fee">
              <input id="fee" type="number" min="0" className={fieldClass} value={values.registrationFee} onChange={(event) => update('registrationFee', Number(event.target.value))} />
            </AuthField>
            <div />
            <AuthField id="reg-s" label="Registration Start Date">
              <input id="reg-s" type="date" className={fieldClass} value={values.registrationStartKey} onChange={(event) => update('registrationStartKey', event.target.value)} />
            </AuthField>
            <AuthField id="reg-e" label="Registration End Date">
              <input id="reg-e" type="date" className={fieldClass} value={values.registrationEndKey} onChange={(event) => update('registrationEndKey', event.target.value)} />
            </AuthField>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField id="mf" label="Match Format">
              <select
                id="mf"
                className={fieldClass}
                value={values.matchFormat}
                onChange={(event) => {
                  update('matchFormat', event.target.value)
                  update('overs', FORMAT_OVERS[event.target.value] || 20)
                }}
              >
                {MATCH_FORMATS.filter((item) => item !== 'Test').map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </AuthField>
            <AuthField id="overs" label="Number of Overs">
              <input id="overs" type="number" min="1" className={fieldClass} value={values.overs} onChange={(event) => update('overs', Number(event.target.value))} />
            </AuthField>
            <AuthField id="dur" label="Match Duration">
              <input id="dur" className={fieldClass} value={values.matchDuration} onChange={(event) => update('matchDuration', event.target.value)} />
            </AuthField>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField id="ts" label="Tournament Start Date">
              <input id="ts" type="date" className={fieldClass} value={values.startDateKey} onChange={(event) => update('startDateKey', event.target.value)} />
            </AuthField>
            <AuthField id="te" label="Tournament End Date">
              <input id="te" type="date" className={fieldClass} value={values.endDateKey} onChange={(event) => update('endDateKey', event.target.value)} />
            </AuthField>
            <AuthField id="ground" label="Default Ground">
              <select
                id="ground"
                className={fieldClass}
                value={values.defaultGround || grounds.find((item) => item.status !== 'Under Maintenance')?.id || ''}
                onChange={(event) => update('defaultGround', event.target.value)}
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
          </div>
        ) : null}

        {step === 5 ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <Summary label="Name" value={values.name} />
            <Summary label="Location" value={values.location} />
            <Summary label="Format" value={values.format} />
            <Summary label="Teams" value={`${values.minTeams} – ${values.maxTeams}`} />
            <Summary label="Fee" value={`₹${Number(values.registrationFee).toLocaleString('en-IN')}`} />
            <Summary label="Match format" value={`${values.matchFormat} · ${values.overs} overs`} />
            <Summary label="Starts" value={formatDateKey(values.startDateKey)} />
            <Summary label="Ends" value={formatDateKey(values.endDateKey)} />
          </dl>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-40">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white">
              Continue
            </button>
          ) : (
            <button type="button" disabled={saving} onClick={handleCreate} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Tournament'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Summary({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</dd>
    </div>
  )
}
