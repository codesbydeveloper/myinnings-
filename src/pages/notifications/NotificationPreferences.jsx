import { Link } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'
import { useToast } from '../../context/ToastContext'
import { PREFERENCE_META } from '../../utils/inbox'
import { TOURNAMENT_WIP } from '../../utils/constants'

export default function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications()
  const { showToast } = useToast()

  function toggle(key) {
    const next = { ...preferences, [key]: !preferences[key] }
    updatePreferences(next)
    showToast('Notification preferences saved.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/notifications" className="text-sm font-semibold text-emerald-700">
          Back to Notifications
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Notification Preferences
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose which frontend alerts you want to receive. Preferences are stored on this device.
        </p>
      </div>

      <div className="space-y-4">
        {(TOURNAMENT_WIP
          ? PREFERENCE_META.filter((group) => group.group !== 'Tournament notifications')
          : PREFERENCE_META
        ).map((group) => (
          <section key={group.group} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{group.group}</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {group.items.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences[item.key] !== false}
                    onClick={() => toggle(item.key)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                      preferences[item.key] !== false ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        preferences[item.key] !== false ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
