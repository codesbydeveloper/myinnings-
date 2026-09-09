import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../common/Icons'
import { useNotifications } from '../../context/NotificationContext'
import { categoryMeta, formatRelativeTime } from '../../data/notificationModel'

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const recent = notifications.slice(0, 6)

  useEffect(() => {
    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  function openItem(item) {
    markRead(item.id)
    setOpen(false)
    if (item.route) navigate(item.route)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Icon name="notifications" className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-slate-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:mt-0 max-sm:w-auto">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-400">Recent notifications</p>
            </div>
            {unreadCount ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          {recent.length ? (
            <ul className="max-h-[min(24rem,60vh)] divide-y divide-slate-100 overflow-y-auto">
              {recent.map((item) => {
                const meta = categoryMeta(item.category)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                        item.isRead ? 'bg-white' : 'bg-emerald-50/50'
                      }`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-base">
                        {item.emoji || meta.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                          {!item.isRead ? (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500">
                          {item.message}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500">You&apos;re all caught up!</p>
          )}
          <div className="border-t border-slate-100 p-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center justify-center rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              View All
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
