import BrandMark from '../common/BrandMark'
import Icon from '../common/Icons'
import { TOURNAMENT_WIP } from '../../utils/constants'

const BENEFITS = [
  {
    icon: 'teams',
    title: 'Teams and players',
    text: 'Keep squads, roles, and availability organised.',
  },
  {
    icon: 'tournaments',
    title: TOURNAMENT_WIP ? 'Matches and fixtures' : 'Matches and tournaments',
    text: TOURNAMENT_WIP
      ? 'Plan fixtures and track match results.'
      : 'Plan fixtures, track results, and manage events.',
  },
  {
    icon: 'finance',
    title: 'Club finances',
    text: 'Follow dues, expenses, and payments in one place.',
  },
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-svh overflow-x-hidden lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full border border-white/5" />
          <div className="absolute right-8 bottom-8 h-56 w-56 rounded-full border border-white/5" />
          <div className="absolute top-1/3 right-12 h-40 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent" />
        </div>

        <div className="relative">
          <BrandMark size="lg" />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
            Cricket operations
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white xl:text-4xl">
            Run your cricket club with clarity and control.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            MyInnings helps captains, managers, and organisers manage teams,
            matches, tournaments, and finances from one professional workspace.
          </p>

          <ul className="mt-10 space-y-4">
            {BENEFITS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-emerald-400">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Trusted by club sides, corporate teams, and tournament organisers.
        </p>
      </aside>

      <main className="flex min-h-svh items-start justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:items-center lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandMark theme="light" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
