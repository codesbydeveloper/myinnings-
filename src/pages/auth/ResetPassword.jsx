import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordField from '../../components/auth/PasswordField'
import Icon from '../../components/common/Icons'
import Spinner from '../../components/common/Spinner'
import { useToast } from '../../context/ToastContext'
import {
  isStrongPassword,
  primaryButtonClass,
  simulateRequest,
} from '../../utils/helpers'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const nextErrors = {}
    if (!password) nextErrors.password = 'New password is required.'
    else if (!isStrongPassword(password)) {
      nextErrors.password =
        'Password must be at least 8 characters and include a letter and a number.'
    }
    if (!confirmPassword) nextErrors.confirmPassword = 'Confirm your new password.'
    else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    await simulateRequest()
    setLoading(false)
    setSuccess(true)
    showToast('Your password has been reset. Please sign in.')
  }

  useEffect(() => {
    if (!success) return undefined
    const timer = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [success, navigate])

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {success ? (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon name="check" className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Password updated
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Your password has been reset successfully. Redirecting you to sign
              in...
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Reset password
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Choose a new password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a strong password to secure your MyInnings account.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <AuthField
                id="password"
                label="New password"
                error={errors.password}
                hint="At least 8 characters, with a letter and a number."
              >
                <PasswordField
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </AuthField>

              <AuthField
                id="confirmPassword"
                label="Confirm new password"
                error={errors.confirmPassword}
              >
                <PasswordField
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </AuthField>

              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? (
                  <>
                    <Spinner />
                    Updating password...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-6 block text-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
