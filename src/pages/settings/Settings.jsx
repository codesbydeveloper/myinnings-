import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import UserAvatar from '../../components/common/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { PAGE_META, ROLES } from '../../utils/constants'
import { resetDemoData } from '../../utils/demoReset'

export default function Settings() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { title, description } = PAGE_META['/settings']
  const [confirmReset, setConfirmReset] = useState(false)
  const canReset = user?.role === ROLES.ADMIN

  function handleReset() {
    resetDemoData()
    showToast('Demo data has been restored.')
    window.setTimeout(() => {
      window.location.reload()
    }, 400)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </section>

      {user && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-800">My Account</p>
          <div className="mt-4 flex items-center gap-4">
            <UserAvatar name={user.name} className="h-12 w-12 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-sm text-slate-500">{user.role}</p>
              <p className="truncate text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-slate-800">Notifications</p>
        <p className="mt-1 text-sm text-slate-500">
          Manage which alerts you receive for matches, payments, and grounds.
        </p>
        <Link
          to="/notifications/preferences"
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white"
        >
          Notification preferences
        </Link>
      </section>

      {canReset ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-slate-800">Demo data</p>
          <p className="mt-1 text-sm text-slate-500">
            Restore the original MyInnings demonstration data. Your login session is kept.
          </p>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Reset Demo Data
          </button>
        </section>
      ) : null}

      <ConfirmModal
        open={confirmReset}
        title="Reset all demo data?"
        description="Are you sure you want to reset all demo data? All changes made during this demo will be replaced with the original demo data."
        confirmLabel="Reset Demo Data"
        icon="alert"
        variant="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
    </div>
  )
}
