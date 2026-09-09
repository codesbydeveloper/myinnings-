import { Link, useNavigate } from 'react-router-dom'
import Icon from '../common/Icons'
import EmptyDashboardState from './EmptyDashboardState'
import SectionCard from './SectionCard'
import { useNotifications } from '../../context/NotificationContext'
import { categoryMeta, formatRelativeTime } from '../../data/notificationModel'

export default function NotificationsWidget({ notifications = [] }) {
  const { markRead } = useNotifications()
  const navigate = useNavigate()
  const items = notifications.slice(0, 5)

  function openItem(item) {
    if (item.id) markRead(item.id)
    if (item.route) navigate(item.route)
    else navigate('/notifications')
  }

  return (
    <SectionCard
      title="Notifications"
      action={
        <Link to="/notifications" className="text-sm font-medium text-emerald-700">
          View all
        </Link>
      }
    >
      {items.length === 0 ? (
        <EmptyDashboardState
          icon="notifications"
          title="No Notifications"
          description="You're all caught up!"
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const unread = item.isRead === false || item.unread
            const meta = categoryMeta(item.category)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className={`w-full rounded-lg px-3 py-3 text-left ${
                    unread ? 'border-l-2 border-emerald-500 bg-emerald-50/50' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm">
                      {item.emoji || meta.emoji || <Icon name={item.icon || meta.icon} className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.message || item.description}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {item.createdAt ? formatRelativeTime(item.createdAt) : item.time}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
