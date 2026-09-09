import { Link } from 'react-router-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { categoryMeta, formatRelativeTime } from '../../data/notificationModel'

export default function NotificationList({
  items = [],
  emptyTitle = 'No Notifications',
  emptyDescription = "You're all caught up!",
  onOpen,
  onMarkRead,
  onDelete,
}) {
  if (!items.length) {
    return (
      <EmptyDashboardState
        icon="notifications"
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const meta = categoryMeta(item.category)
        return (
          <li
            key={item.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${
              item.isRead ? 'border-slate-200' : 'border-emerald-200 bg-emerald-50/30'
            }`}
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-lg">
                {item.emoji || meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 sm:text-base">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 break-words text-slate-600">{item.message}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {item.category}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(item.createdAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.route ? (
                    <button
                      type="button"
                      onClick={() => onOpen?.(item)}
                      className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                    >
                      Open Related Item
                    </button>
                  ) : (
                    <Link
                      to="/notifications"
                      className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                    >
                      View
                    </Link>
                  )}
                  {!item.isRead ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead?.(item)}
                      className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700"
                    >
                      Mark as Read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete?.(item)}
                    className="inline-flex min-h-11 items-center rounded-xl border border-red-100 px-3 text-sm font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
