import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../common/BrandMark'
import Icon from '../common/Icons'
import UserAvatar from '../common/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getNavigation } from '../../utils/navigation'
import NavItem from './NavItem'

export default function MobileMenu({ open, onClose }) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { main, admin } = getNavigation(user?.role)
  const withBadge = (items) =>
    items.map((item) => (item.to === '/notifications' ? { ...item, badge: unreadCount } : item))

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-40 print:hidden lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/60 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        className={`absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-slate-950 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <Link to="/dashboard" onClick={onClose}>
            <BrandMark />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Menu
          </p>
          <div className="space-y-1">
            {withBadge(main).map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onClose} />
            ))}
          </div>

          {admin.length > 0 && (
            <>
              <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Administration
              </p>
              <div className="space-y-1">
                {withBadge(admin).map((item) => (
                  <NavItem key={item.to} item={item} onNavigate={onClose} />
                ))}
              </div>
            </>
          )}
        </nav>

        {user && (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
