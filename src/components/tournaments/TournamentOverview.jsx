import { Link } from 'react-router-dom'
import SectionCard from '../dashboard/SectionCard'
import StatusBadge from '../dashboard/StatusBadge'
import { formatINR } from '../../utils/helpers'
import { approvedRegistrations } from '../../data/tournamentModel'

const STEPS = [
  'Registration Open',
  'Registration Closed',
  'Fixtures Generated',
  'Ongoing',
  'Completed',
]

const ORDER = [
  'Draft',
  'Registration Open',
  'Registration Closed',
  'Fixtures Generated',
  'Ongoing',
  'Completed',
]

export default function TournamentOverview({
  tournament,
  canEdit,
  canComplete,
  onStatus,
  onGenerate,
  onComplete,
  approvedCount,
}) {
  const current = ORDER.indexOf(tournament.status)
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Tournament Information">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Organizer" value={tournament.organizer} />
            <Info label="Location" value={tournament.location} />
            <Info label="Tournament format" value={tournament.format} />
            <Info label="Match format" value={`${tournament.matchFormat} · ${tournament.overs} overs`} />
            <Info label="Maximum teams" value={String(tournament.maxTeams)} />
            <Info label="Registered teams" value={String(approvedCount ?? approvedRegistrations(tournament).length)} />
            <Info label="Registration fee" value={formatINR(tournament.registrationFee)} />
            <Info label="Status" value={<StatusBadge status={tournament.status} />} />
          </dl>
        </SectionCard>
        <SectionCard title="Tournament Schedule">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Registration start" value={tournament.registrationStart} />
            <Info label="Registration end" value={tournament.registrationEnd} />
            <Info label="Tournament start" value={tournament.startDate} />
            <Info label="Tournament end" value={tournament.endDate} />
            <Info label="Default ground" value={tournament.defaultGround} />
            <Info
              label="Tournament grounds"
              value={
                (tournament.grounds || []).length
                  ? tournament.grounds.map((item) => item.name).join(', ')
                  : tournament.defaultGround
              }
            />
            <Info label="Match duration" value={tournament.matchDuration} />
          </dl>
        </SectionCard>
      </div>

      <SectionCard title="Tournament Timeline">
        <ol className="space-y-0">
          {STEPS.map((step, index) => {
            const done = current > ORDER.indexOf(step) || tournament.status === 'Completed'
            const active = tournament.status === step || (step === 'Ongoing' && tournament.status === 'Fixtures Generated' && false)
            return (
              <li key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${done || active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {index < STEPS.length - 1 ? <span className="w-px flex-1 bg-slate-200" /> : null}
                </div>
                <div className={index < STEPS.length - 1 ? 'pb-4' : ''}>
                  <p className="text-sm font-semibold text-slate-800">{step === 'Ongoing' ? 'Tournament Ongoing' : step === 'Completed' ? 'Tournament Completed' : step}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </SectionCard>

      {tournament.winner ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
            Tournament Winner
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{tournament.winner}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <Link
            to={`/tournaments/${tournament.id}/edit`}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            Edit Tournament
          </Link>
        ) : null}
        {canEdit && tournament.status === 'Draft' ? (
          <button type="button" onClick={() => onStatus('Registration Open')} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">
            Open Registration
          </button>
        ) : null}
        {canEdit && tournament.status === 'Registration Open' ? (
          <button type="button" onClick={() => onStatus('Registration Closed')} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            Close Registration
          </button>
        ) : null}
        {canEdit && ['Registration Closed', 'Registration Open'].includes(tournament.status) ? (
          <button type="button" onClick={onGenerate} className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
            Generate Fixtures
          </button>
        ) : null}
        {canEdit && tournament.status === 'Fixtures Generated' ? (
          <button type="button" onClick={() => onStatus('Ongoing')} className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">
            Start Tournament
          </button>
        ) : null}
        {canComplete && tournament.status !== 'Completed' ? (
          <button type="button" onClick={onComplete} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">
            Complete Tournament
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value || '—'}</dd>
    </div>
  )
}
