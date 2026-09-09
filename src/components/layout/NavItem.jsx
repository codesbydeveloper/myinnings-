import { NavLink } from 'react-router-dom'
import Icon from '../common/Icons'

export default function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
          isActive
            ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
        ].join(' ')
      }
    >
      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-slate-950">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}
