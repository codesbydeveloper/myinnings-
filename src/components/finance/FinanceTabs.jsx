import { NavLink } from 'react-router-dom'

export default function FinanceTabs({ tabs }) {
  if (!tabs?.length) return null

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <nav className="flex min-w-max gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.to === '/finance'}
            className={({ isActive }) =>
              `min-h-11 px-4 text-sm font-semibold whitespace-nowrap ${
                isActive
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
