import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import { TOURNAMENT_WIP } from '../../utils/constants'

export default function BookingList({
  bookings = [],
  canCancel,
  onCancel,
}) {
  if (!bookings.length) {
    return (
      <EmptyDashboardState
        icon="grounds"
        title="No Bookings"
        description="This ground does not have any bookings yet."
      />
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Related To</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-3 font-semibold text-slate-900">{item.code}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{item.date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {item.startTime} – {item.endTime}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.type}</td>
                <td className="max-w-[200px] px-4 py-3 text-slate-600">
                  {!TOURNAMENT_WIP && item.tournamentName ? (
                    <span className="block font-medium text-slate-800">{item.tournamentName}</span>
                  ) : null}
                  {item.matchTitle ? (
                    <span className="mt-0.5 block text-xs text-slate-500">{item.matchTitle}</span>
                  ) : null}
                  {(!item.tournamentName || TOURNAMENT_WIP) && !item.matchTitle ? '—' : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {canCancel?.(item) ? (
                    <button
                      type="button"
                      onClick={() => onCancel(item)}
                      className="text-sm font-semibold text-red-600"
                    >
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {bookings.map((item) => (
          <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{item.code}</p>
                <p className="mt-1 text-sm text-slate-600">{item.date}</p>
                <p className="text-xs text-slate-500">
                  {item.startTime} – {item.endTime}
                </p>
                <p className="mt-1 text-xs break-words text-slate-500">
                  {item.type}
                  {!TOURNAMENT_WIP && item.tournamentName ? ` · ${item.tournamentName}` : ''}
                  {item.matchTitle ? ` · ${item.matchTitle}` : ''}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            {canCancel?.(item) ? (
              <button
                type="button"
                onClick={() => onCancel(item)}
                className="mt-3 min-h-11 w-full rounded-xl border border-red-100 text-sm font-semibold text-red-600"
              >
                Cancel Booking
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}
