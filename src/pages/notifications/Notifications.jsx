import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import NotificationList from '../../components/notifications/NotificationList'
import { useFinance } from '../../context/FinanceContext'
import { useGrounds } from '../../context/GroundContext'
import { useMatches } from '../../context/MatchContext'
import { useNotifications } from '../../context/NotificationContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { matchesNotificationFilter, NOTIFICATION_FILTERS } from '../../data/notificationModel'

export default function Notifications() {
  const { notifications, markRead, markAllRead, deleteNotification, unreadCount, clearRead } = useNotifications()
  const { getMatch } = useMatches()
  const { getTournament } = useTournaments()
  const { getGround } = useGrounds()
  const { payments } = useFinance()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)

  const items = notifications.filter((item) => matchesNotificationFilter(item, filter))

  function resolveRoute(item) {
    const type = item.relatedEntityType
    const id = item.relatedEntityId
    if (type === 'match' && id && !getMatch(id)) {
      showToast('This match is no longer available.', 'error')
      return '/matches'
    }
    if (type === 'tournament' && id && !getTournament(id)) {
      showToast('This tournament is no longer available.', 'error')
      return '/tournaments'
    }
    if (type === 'ground' && id && !getGround(id)) {
      showToast('This ground is no longer available.', 'error')
      return '/grounds'
    }
    if (type === 'payment' && id && !payments.some((entry) => entry.id === id)) {
      return '/finance/payments'
    }
    return item.route || '/notifications'
  }

  function handleOpen(item) {
    markRead(item.id)
    navigate(resolveRoute(item))
  }

  const emptyTitle = filter === 'unread' ? 'No Unread Notifications' : 'No Notifications'
  const emptyDescription =
    filter === 'unread' ? 'You have no unread notifications.' : "You're all caught up!"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Stay updated with your teams, matches, tournaments, and payments.
          </p>
        </section>
        <div className="flex flex-wrap gap-2">
          {unreadCount ? (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              Mark all as read
            </button>
          ) : null}
          {notifications.some((item) => item.isRead) ? (
            <button
              type="button"
              onClick={() => {
                clearRead()
                showToast('Read notifications cleared.')
              }}
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              Clear read
            </button>
          ) : null}
          <Link
            to="/notifications/preferences"
            className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
          >
            Preferences
          </Link>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          {NOTIFICATION_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold whitespace-nowrap ${
                filter === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <NotificationList
        items={items}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        onOpen={handleOpen}
        onMarkRead={(item) => markRead(item.id)}
        onDelete={setPendingDelete}
      />

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this notification?"
        description="This removes the notification from your inbox. It does not change the related match, payment, or booking."
        confirmLabel="Delete"
        icon="alert"
        variant="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          deleteNotification(pendingDelete.id)
          setPendingDelete(null)
          showToast('Notification deleted.')
        }}
      />
    </div>
  )
}
