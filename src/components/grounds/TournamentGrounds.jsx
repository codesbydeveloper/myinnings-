import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import GroundImage from './GroundImage'

export default function TournamentGrounds({
  tournament,
  grounds = [],
  availabilityOf,
  canManage,
  selectedIds = [],
  onToggle,
  onSave,
  saving,
}) {
  const associated = grounds.filter((item) => (tournament.groundIds || selectedIds).includes(item.id))

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Tournament Grounds</h3>
        <p className="mt-1 text-sm text-slate-500">
          Associate one or more venues. Fixtures can use these grounds when they are generated.
        </p>
        {canManage ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {grounds
              .filter((item) => item.status !== 'Under Maintenance')
              .map((ground) => {
                const checked = selectedIds.includes(ground.id)
                return (
                  <li key={ground.id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-3 ${
                        checked ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-emerald-600"
                        checked={checked}
                        onChange={() => onToggle(ground.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-slate-900">{ground.name}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{ground.city || ground.location}</span>
                        <span className="mt-2 inline-block">
                          <StatusBadge status={availabilityOf?.(ground) || ground.status} />
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
          </ul>
        ) : associated.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {associated.map((ground) => (
              <li key={ground.id} className="overflow-hidden rounded-2xl border border-slate-200">
                <GroundImage ground={ground} className="h-24 w-full" />
                <div className="p-3">
                  <p className="font-semibold text-slate-900">{ground.name}</p>
                  <p className="text-xs text-slate-500">{ground.city || ground.location}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyDashboardState
              icon="grounds"
              title="No tournament grounds"
              description="No venues have been associated with this tournament yet."
            />
          </div>
        )}
        {canManage ? (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="mt-4 min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Tournament Grounds'}
          </button>
        ) : null}
      </section>
    </div>
  )
}
