import { useState } from 'react'
import { DEMO_PASSWORD, DEMO_USERS } from '../../utils/constants'
import Icon from '../common/Icons'

const ROLE_HINTS = {
  'Platform Admin': 'Full platform access, reports, and demo reset',
  'Team Manager': 'Teams, matches, squads, finance, and bookings',
  'Team Captain': 'Team matches, squads, and tournament registration',
  'Tournament Organizer': 'Tournaments, fixtures, approvals, and venues',
  Player: 'Availability, squad updates, and personal payments',
}

export default function DemoAccess({ selectedId, onSelect }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-700">Demo Access</span>
        <Icon
          name="chevronDown"
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Choose a role to explore MyInnings. Shared password: {DEMO_PASSWORD}
      </p>

      {open && (
        <div className="mt-3 space-y-2">
          {DEMO_USERS.map((user) => {
            const active = selectedId === user.id
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${
                  active ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.role}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{user.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {ROLE_HINTS[user.role] || user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelect(user)}
                  className="min-h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Use Account
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
