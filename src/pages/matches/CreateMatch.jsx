import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import AuthField from '../../components/auth/AuthField'
import WizardSteps from '../../components/matches/WizardSteps'
import StatusBadge from '../../components/dashboard/StatusBadge'
import TeamLogo from '../../components/teams/TeamLogo'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useGrounds } from '../../context/GroundContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { FORMAT_OVERS, MATCH_FORMATS } from '../../data/grounds'
import { durationForFormat, parseTimeToMinutes, toInputTime } from '../../data/groundModel'
import { formatDateKey } from '../../data/matchModel'
import { fieldClass, simulateRequest } from '../../utils/helpers'
import { canCreateMatch, getMatchableTeams } from '../../utils/matchAccess'

const STEPS = ['Select Team', 'Opponent', 'Details', 'Ground', 'Review']

const EMPTY = {
  homeTeamId: '',
  opponentType: 'internal',
  awayTeamId: '',
  opponentName: '',
  opponentLocation: '',
  opponentContact: '',
  dateKey: '',
  timeValue: '10:00',
  format: 'T20',
  overs: 20,
  title: '',
  description: '',
  squadSize: 11,
  ground: null,
}

function toDisplayTime(value) {
  if (!value) return ''
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour = ((hours + 11) % 12) + 1
  return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export default function CreateMatch() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { createMatch } = useMatches()
  const { grounds, checkAvailability, syncMatchBooking, availabilityOf } = useGrounds()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const matchable = useMemo(
    () => getMatchableTeams(teams, players, user),
    [players, teams, user],
  )
  const homeTeam = teams.find((team) => team.id === values.homeTeamId)
  const awayTeam = teams.find((team) => team.id === values.awayTeamId)
  const opponents = teams.filter(
    (team) => team.status === 'Active' && team.id !== values.homeTeamId,
  )

  if (!canCreateMatch(user?.role)) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to create matches."
        to="/matches"
        actionLabel="Back to Matches"
      />
    )
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function validateStep() {
    if (step === 0 && !values.homeTeamId) return 'Select a team to continue.'
    if (step === 1) {
      if (values.opponentType === 'internal' && !values.awayTeamId) {
        return 'Select an opponent team.'
      }
      if (values.opponentType === 'external' && !values.opponentName.trim()) {
        return 'Enter the opponent team name.'
      }
    }
    if (step === 2) {
      if (!values.dateKey) return 'Match date is required.'
      if (!values.timeValue) return 'Match time is required.'
      if (!values.format) return 'Match format is required.'
    }
    if (step === 3 && !values.ground) return 'Select a ground.'
    if (step === 3 && values.ground && values.dateKey) {
      const window = matchWindow()
      const check = checkAvailability({ groundId: values.ground.id, ...window })
      if (!check.available) return check.message
    }
    return ''
  }

  function next() {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    setError('')
    setStep((value) => Math.min(value + 1, STEPS.length - 1))
  }

  function matchWindow() {
    const start = parseTimeToMinutes(values.timeValue) ?? 10 * 60
    const end = start + durationForFormat(values.format)
    return {
      dateKey: values.dateKey,
      startTime: toInputTime(start),
      endTime: toInputTime(end),
      startInput: toInputTime(start),
      endInput: toInputTime(end),
    }
  }

  async function handleCreate(asDraft = false) {
    const message = validateStep()
    if (message) {
      setError(message)
      return
    }
    if (!values.ground) {
      setError('Select a ground.')
      return
    }
    if (values.dateKey) {
      const check = checkAvailability({ groundId: values.ground.id, ...matchWindow() })
      if (!check.available) {
        setError(check.message)
        return
      }
    }
    setSaving(true)
    await simulateRequest(500)
    const match = createMatch({
      ...values,
      date: formatDateKey(values.dateKey),
      time: toDisplayTime(values.timeValue),
      opponentName: values.opponentName,
      opponentLocation: values.opponentLocation,
      opponentContact: values.opponentContact,
      status: asDraft ? 'Draft' : 'Upcoming',
    })
    setSaving(false)
    if (!match) {
      setError('You do not have permission to create this match.')
      return
    }
    syncMatchBooking(match)
    showToast(asDraft ? 'Draft match saved.' : 'Match created successfully.')
    navigate(`/matches/${match.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/matches" className="text-sm font-semibold text-emerald-700">
          Back to Matches
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Create Match
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Set up a standalone cricket match, then manage availability and squad.
        </p>
      </div>

      <WizardSteps steps={STEPS} current={step} onSelect={setStep} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {step === 0 ? (
          matchable.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {matchable.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => update('homeTeamId', team.id)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
                  values.homeTeamId === team.id
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-200'
                }`}
              >
                <TeamLogo team={team} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{team.name}</span>
                  <span className="mt-1 block text-sm text-slate-500">{team.location}</span>
                  <span className="mt-1 block text-xs text-slate-400">{team.players} players</span>
                </span>
              </button>
            ))}
          </div>
          ) : (
            <p className="text-sm text-slate-500">
              No authorized teams are available for match creation.
            </p>
          )
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update('opponentType', 'internal')}
                className={`min-h-11 rounded-xl border text-sm font-semibold ${
                  values.opponentType === 'internal'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                MyInnings team
              </button>
              <button
                type="button"
                onClick={() => update('opponentType', 'external')}
                className={`min-h-11 rounded-xl border text-sm font-semibold ${
                  values.opponentType === 'external'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                External opponent
              </button>
            </div>
            {values.opponentType === 'internal' ? (
              opponents.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {opponents.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => update('awayTeamId', team.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left ${
                      values.awayTeamId === team.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <TeamLogo team={team} size="sm" />
                    <span>
                      <span className="block font-semibold text-slate-900">{team.name}</span>
                      <span className="text-sm text-slate-500">{team.location}</span>
                    </span>
                  </button>
                ))}
              </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No other registered teams are available. Add an external opponent instead.
                </p>
              )
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AuthField id="opp-name" label="Opponent Team Name">
                  <input
                    id="opp-name"
                    className={fieldClass}
                    value={values.opponentName}
                    onChange={(event) => update('opponentName', event.target.value)}
                  />
                </AuthField>
                <AuthField id="opp-loc" label="Location">
                  <input
                    id="opp-loc"
                    className={fieldClass}
                    value={values.opponentLocation}
                    onChange={(event) => update('opponentLocation', event.target.value)}
                  />
                </AuthField>
                <AuthField id="opp-contact" label="Contact Person">
                  <input
                    id="opp-contact"
                    className={fieldClass}
                    value={values.opponentContact}
                    onChange={(event) => update('opponentContact', event.target.value)}
                    placeholder="Optional"
                  />
                </AuthField>
              </div>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <AuthField id="match-date" label="Match Date">
              <input
                id="match-date"
                type="date"
                className={fieldClass}
                value={values.dateKey}
                onChange={(event) => update('dateKey', event.target.value)}
              />
            </AuthField>
            <AuthField id="match-time" label="Match Time">
              <input
                id="match-time"
                type="time"
                className={fieldClass}
                value={values.timeValue}
                onChange={(event) => update('timeValue', event.target.value)}
              />
            </AuthField>
            <AuthField id="match-format" label="Match Format">
              <select
                id="match-format"
                className={fieldClass}
                value={values.format}
                onChange={(event) => {
                  update('format', event.target.value)
                  update('overs', FORMAT_OVERS[event.target.value] || 20)
                }}
              >
                {MATCH_FORMATS.filter((item) => item !== 'Test').map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </AuthField>
            <AuthField id="match-overs" label="Number of Overs">
              <input
                id="match-overs"
                type="number"
                min="1"
                className={fieldClass}
                value={values.overs}
                onChange={(event) => update('overs', Number(event.target.value))}
              />
            </AuthField>
            <AuthField id="match-title" label="Match Title">
              <input
                id="match-title"
                className={fieldClass}
                value={values.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Optional"
              />
            </AuthField>
            <AuthField id="match-size" label="Squad Size">
              <input
                id="match-size"
                type="number"
                min="8"
                max="15"
                className={fieldClass}
                value={values.squadSize}
                onChange={(event) => update('squadSize', Number(event.target.value))}
              />
            </AuthField>
            <div className="md:col-span-2">
              <AuthField id="match-desc" label="Description">
                <textarea
                  id="match-desc"
                  rows={3}
                  className={fieldClass}
                  value={values.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Optional"
                />
              </AuthField>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select an available ground for {formatDateKey(values.dateKey) || 'the match date'} at{' '}
              {toDisplayTime(values.timeValue)}. Conflicts are checked against existing bookings.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {grounds.map((ground) => {
                const maintenance = ground.status === 'Under Maintenance'
                const selected = values.ground?.id === ground.id
                const check =
                  selected && values.dateKey
                    ? checkAvailability({ groundId: ground.id, ...matchWindow() })
                    : null
                return (
                  <button
                    key={ground.id}
                    type="button"
                    disabled={maintenance}
                    onClick={() => update('ground', ground)}
                    className={`rounded-2xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? check && !check.available
                          ? 'border-red-400 bg-red-50/50'
                          : 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-900">{ground.name}</p>
                      <StatusBadge status={availabilityOf(ground)} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{ground.city || ground.location}</p>
                    {ground.capacity ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Capacity {Number(ground.capacity).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                    {selected && check ? (
                      <p className={`mt-2 text-xs font-semibold ${check.available ? 'text-emerald-700' : 'text-red-600'}`}>
                        {check.available ? '✓ Ground available for this match' : `✕ ${check.message}`}
                      </p>
                    ) : null}
                  </button>
                )
              })}
            </div>
            <Link to="/grounds" className="text-sm font-semibold text-emerald-700">
              Browse all grounds
            </Link>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5 text-center">
              <p className="text-lg font-semibold text-slate-900">{homeTeam?.name}</p>
              <p className="my-2 text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                vs
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {values.opponentType === 'internal' ? awayTeam?.name : values.opponentName}
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Summary label="Date" value={formatDateKey(values.dateKey)} />
              <Summary label="Time" value={toDisplayTime(values.timeValue)} />
              <Summary label="Ground" value={values.ground?.name} />
              <Summary label="Format" value={`${values.format} · ${values.overs} overs`} />
            </dl>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Continue
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleCreate(true)}
                className="min-h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleCreate(false)}
                className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              >
                {saving ? 'Creating...' : 'Create Match'}
              </button>
            </div>
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
