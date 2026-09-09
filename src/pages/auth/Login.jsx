import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import DemoAccess from '../../components/auth/DemoAccess'
import PasswordField from '../../components/auth/PasswordField'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { DEMO_PASSWORD } from '../../utils/constants'
import { getFieldClass, isValidEmail, primaryButtonClass } from '../../utils/helpers'
import { loadRememberedEmail } from '../../utils/storage'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState(() => loadRememberedEmail())
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(loadRememberedEmail()))
  const [selectedDemo, setSelectedDemo] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function applyDemo(user) {
    setEmail(user.email)
    setPassword(DEMO_PASSWORD)
    setSelectedDemo(user.id)
    setErrors({})
    setFormError('')
  }

  function validate() {
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    else if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.'
    if (!password) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    const result = await login({ email, password, remember })
    setLoading(false)

    if (!result.ok) {
      setFormError(result.message)
      return
    }

    showToast(`Welcome back, ${result.user.name}.`)
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Sign in
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in with a demo role to explore teams, matches, finance, and reports.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <AuthField id="email" label="Email address" error={errors.email}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@club.com"
              autoComplete="email"
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              className={getFieldClass(errors.email)}
            />
          </AuthField>

          <AuthField id="password" label="Password" error={errors.password}>
            <PasswordField
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              disabled={loading}
            />
          </AuthField>

          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? (
              <>
                <Spinner />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="mt-6">
          <DemoAccess selectedId={selectedDemo} onSelect={applyDemo} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to MyInnings?{' '}
          <Link
            to="/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
