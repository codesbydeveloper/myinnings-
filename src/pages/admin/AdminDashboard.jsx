import { Link } from 'react-router-dom'
import ResourcePage from '../../components/common/ResourcePage'
import QuickActions from '../../components/dashboard/QuickActions'

const LINKS = [
  { label: 'Users', to: '/users', copy: 'Review demo accounts and registered platform users.' },
  { label: 'Teams', to: '/teams', copy: 'Oversee clubs, rosters, and team status.' },
  { label: 'Grounds', to: '/grounds', copy: 'Manage venues, availability, and bookings.' },
  { label: 'Reports', to: '/reports', copy: 'Open live match, finance, and venue reports.' },
]

export default function AdminDashboard() {
  return (
    <ResourcePage pathname="/admin">
      <QuickActions
        actions={[
          { label: 'Manage Users', to: '/users', icon: 'user' },
          { label: 'Manage Teams', to: '/teams', icon: 'teams' },
          { label: 'View Reports', to: '/reports', icon: 'reports' },
          { label: 'Create Tournament', to: '/tournaments/new', icon: 'tournaments' },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{item.copy}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm leading-6 text-slate-500">
        Use the{' '}
        <Link to="/dashboard" className="font-medium text-emerald-700">
          platform dashboard
        </Link>{' '}
        for a complete operational overview, or restore original demonstration data from{' '}
        <Link to="/settings" className="font-medium text-emerald-700">
          Settings
        </Link>
        .
      </p>
    </ResourcePage>
  )
}
