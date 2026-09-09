import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../common/Icons'
import NotificationBell from '../notifications/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { getPageMeta } from '../../utils/navigation'
import UserMenu from './UserMenu'

export default function Header({ onMenuOpen }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { title } = getPageMeta(pathname, user?.role)
  const [query, setQuery] = useState('')
  const [mobileSearch, setMobileSearch] = useState(false)

  function handleSearch(event) {
    event.preventDefault()
    const value = query.trim()
    if (!value) {
      navigate('/search')
      return
    }
    navigate(`/search?q=${encodeURIComponent(value)}`)
    setMobileSearch(false)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>

        <p className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </p>

        <form onSubmit={handleSearch} className="hidden min-w-0 max-w-xs flex-1 md:block">
          <label className="relative block">
            <span className="sr-only">Search teams, players, matches, or grounds</span>
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, players..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </form>

        <button
          type="button"
          onClick={() => setMobileSearch((value) => !value)}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 md:hidden"
          aria-label="Search"
          aria-expanded={mobileSearch}
        >
          <Icon name="search" className="h-5 w-5" />
        </button>

        <NotificationBell />

        <div className="min-w-0 border-l border-slate-200 pl-3">
          <UserMenu />
        </div>
      </div>
      {mobileSearch ? (
        <form onSubmit={handleSearch} className="border-t border-slate-100 px-4 py-3 md:hidden">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, players..."
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </form>
      ) : null}
    </header>
  )
}
