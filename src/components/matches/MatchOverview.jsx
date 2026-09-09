import { Link } from 'react-router-dom'
import SectionCard from '../dashboard/SectionCard'
import StatusBadge from '../dashboard/StatusBadge'

export default function MatchOverview({ match, canEdit, canCancel, onCancel, onStatus }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Match Information">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Match date" value={match.date} />
            <Info label="Match time" value={match.time} />
            <Info
              label="Ground"
              value={
                match.groundId ? (
                  <Link to={`/grounds/${match.groundId}`} className="font-semibold text-emerald-700">
                    {match.ground?.name || match.venue}
                  </Link>
                ) : (
                  match.ground?.name || match.venue
                )
              }
            />
            <Info label="Location" value={match.ground?.city || match.ground?.location} />
            <Info label="Format" value={match.format} />
            <Info label="Overs" value={String(match.overs || '—')} />
            <Info label="Match status" value={<StatusBadge status={match.status} />} />
          </dl>
        </SectionCard>
        <SectionCard title="Team Information">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Team" value={match.home} />
            <Info label="Opponent" value={match.away} />
            <Info label="Captain" value={match.captain || 'Unassigned'} />
            <Info label="Source" value={match.source === 'tournament' ? 'Tournament' : 'Standalone'} />
          </dl>
        </SectionCard>
      </div>

      <SectionCard title="Match Timeline">
        <ol className="space-y-3">
          {(match.timeline || []).map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  item.done ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                {item.date ? <p className="text-xs text-slate-400">{item.date}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      {match.cancelReason ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Cancelled: {match.cancelReason}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <Link
            to={`/matches/${match.id}/edit`}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Match
          </Link>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600"
          >
            Cancel Match
          </button>
        ) : null}
        {canEdit && match.status === 'Draft' ? (
          <button
            type="button"
            onClick={() => onStatus('Upcoming')}
            className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
          >
            Publish Match
          </button>
        ) : null}
        {canEdit && match.status === 'Upcoming' ? (
          <button
            type="button"
            onClick={() => onStatus('Live')}
            className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Mark Live
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
