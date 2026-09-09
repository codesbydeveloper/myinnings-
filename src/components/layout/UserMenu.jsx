import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import ConfirmModal from '../common/ConfirmModal'
import Icon from '../common/Icons'
import UserAvatar from '../common/UserAvatar'

export default function UserMenu({ variant = 'light', alwaysShowDetails = false }) {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!user) return null

  const isDark = variant === 'dark'

  function confirmLogout() {
    setConfirmOpen(false)
    logout()
    showToast('You have been signed out.')
    navigate('/login', { replace: true })
  }

  return (
    <>
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition ${
          isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserAvatar name={user.name} />
        <div className={`min-w-0 flex-1 ${alwaysShowDetails ? 'block' : 'hidden sm:block'}`}>
          <p
            className={`truncate text-sm font-medium ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {user.name}
          </p>
          <p
            className={`truncate text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {user.role}
          </p>
        </div>
        <Icon
          name="chevronDown"
          className={`h-4 w-4 shrink-0 transition ${
            open ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-30 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl border p-1.5 shadow-lg ${
            isDark
              ? 'bottom-full mb-2 border-white/10 bg-slate-900'
              : 'top-full mt-2 border-slate-200 bg-white'
          }`}
        >
          <div
            className={`mb-1 rounded-lg px-3 py-2 ${
              isDark ? 'bg-white/5' : 'bg-slate-50'
            }`}
          >
            <p
              className={`truncate text-sm font-medium ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {user.name}
            </p>
            <p
              className={`truncate text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {user.role}
            </p>
          </div>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isDark
                ? 'text-slate-200 hover:bg-white/5'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon name="user" className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isDark
                ? 'text-slate-200 hover:bg-white/5'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon name="settings" className="h-4 w-4" />
            My Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              setConfirmOpen(true)
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              isDark
                ? 'text-red-300 hover:bg-white/5'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Icon name="logout" className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
    <ConfirmModal
      open={confirmOpen}
      title="Sign out of MyInnings?"
      description="You can sign back in anytime with your account or a demo role."
      confirmLabel="Sign out"
      onCancel={() => setConfirmOpen(false)}
      onConfirm={confirmLogout}
    />
    </>
  )
}
