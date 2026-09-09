import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import Icon from '../../components/common/Icons'
import Spinner from '../../components/common/Spinner'
import { getFieldClass, isValidEmail, primaryButtonClass, simulateRequest } from '../../utils/helpers'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setLoading(true)
    await simulateRequest()
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {sent ? (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon name="mail" className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Password reset instructions have been sent to{' '}
              <span className="font-medium text-slate-700">{email.trim()}</span>.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              If you do not see the email, check your spam folder or try again.
            </p>
            <Link
              to="/reset-password"
              className={`${primaryButtonClass} mt-6`}
            >
              Continue to reset password
            </Link>
            <Link
              to="/login"
              className="mt-4 block text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Account recovery
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Forgot password
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the email associated with your account and we will send reset
              instructions.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <AuthField id="email" label="Email address" error={error}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@club.com"
                  autoComplete="email"
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  className={getFieldClass(error)}
                />
              </AuthField>

              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? (
                  <>
                    <Spinner />
                    Sending instructions...
                  </>
                ) : (
                  'Send reset instructions'
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
