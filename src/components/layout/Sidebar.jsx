import { Link } from 'react-router-dom'
import BrandMark from '../common/BrandMark'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { getNavigation } from '../../utils/navigation'
import NavItem from './NavItem'
import UserMenu from './UserMenu'

export default function Sidebar() {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const { main, admin } = getNavigation(user?.role)
  const withBadge = (items) =>
    items.map((item) => (item.to === '/notifications' ? { ...item, badge: unreadCount } : item))

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-slate-950 print:hidden lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/dashboard" className="block">
          <BrandMark />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Menu
        </p>
        <div className="space-y-1">
          {withBadge(main).map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>

        {admin.length > 0 && (
          <>
            <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Administration
            </p>
            <div className="space-y-1">
              {withBadge(admin).map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <UserMenu variant="dark" alwaysShowDetails />
      </div>
    </aside>
  )
}
