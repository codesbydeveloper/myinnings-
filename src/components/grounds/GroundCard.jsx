import { useNavigate } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import GroundImage from './GroundImage'

export default function GroundCard({ ground, availability }) {
  const navigate = useNavigate()
  const facilities = (ground.facilities || []).slice(0, 3)

  return (
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
      onClick={() => navigate(`/grounds/${ground.id}`)}
    >
      <GroundImage ground={ground} className="h-36 w-full" />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">{ground.name}</h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {ground.city || ground.location}
              {ground.state ? `, ${ground.state}` : ''}
            </p>
          </div>
          <StatusBadge status={availability || ground.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Capacity</dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {ground.capacity ? Number(ground.capacity).toLocaleString('en-IN') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">Pitches</dt>
            <dd className="mt-1 font-semibold text-slate-800">{ground.pitches || 1}</dd>
          </div>
        </dl>
        {facilities.length ? (
          <p className="mt-3 truncate text-xs text-slate-500">{facilities.join(' · ')}</p>
        ) : null}
        <div className="mt-auto border-t border-slate-100 pt-3">
          <span className="text-sm font-semibold text-emerald-700">View Ground</span>
        </div>
      </div>
    </article>
  )
}
