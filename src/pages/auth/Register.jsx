import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import AuthLayout from '../../components/auth/AuthLayout'
import PasswordField from '../../components/auth/PasswordField'
import RoleSelector from '../../components/auth/RoleSelector'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getFieldClass,
  isStrongPassword,
  isValidEmail,
  isValidMobile,
  primaryButtonClass,
} from '../../utils/helpers'

const INITIAL_FORM = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  role: '',
  terms: false,
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Full name is required.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    else if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.'
    if (!form.mobile.trim()) nextErrors.mobile = 'Mobile number is required.'
    else if (!isValidMobile(form.mobile)) {
      nextErrors.mobile = 'Enter a valid 10-digit mobile number.'
    }
    if (!form.password) nextErrors.password = 'Password is required.'
    else if (!isStrongPassword(form.password)) {
      nextErrors.password =
        'Password must be at least 8 characters and include a letter and a number.'
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (!form.role) nextErrors.role = 'Select a primary role.'
    if (!form.terms) nextErrors.terms = 'Please accept the terms to continue.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    setLoading(true)
    const result = await register(form)
    setLoading(false)

    if (!result.ok) {
      setFormError(result.message)
      return
    }

    showToast(`Account created. Welcome, ${result.user.name}.`)
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
          Create account
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Join MyInnings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Set up your account to start managing cricket operations.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <AuthField id="name" label="Full name" error={errors.name}>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Rahul Sharma"
              autoComplete="name"
              disabled={loading}
              aria-invalid={Boolean(errors.name)}
              className={getFieldClass(errors.name)}
            />
          </AuthField>

          <AuthField id="email" label="Email address" error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@club.com"
              autoComplete="email"
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              className={getFieldClass(errors.email)}
            />
          </AuthField>

          <AuthField id="mobile" label="Mobile number" error={errors.mobile}>
            <input
              id="mobile"
              type="tel"
              value={form.mobile}
              onChange={(event) => updateField('mobile', event.target.value)}
              placeholder="9876543210"
              autoComplete="tel"
              disabled={loading}
              aria-invalid={Boolean(errors.mobile)}
              className={getFieldClass(errors.mobile)}
            />
          </AuthField>

          <AuthField
            id="password"
            label="Password"
            error={errors.password}
            hint="At least 8 characters, with a letter and a number."
          >
            <PasswordField
              id="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              error={errors.password}
              autoComplete="new-password"
              disabled={loading}
            />
          </AuthField>

          <AuthField
            id="confirmPassword"
            label="Confirm password"
            error={errors.confirmPassword}
          >
            <PasswordField
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={(event) =>
                updateField('confirmPassword', event.target.value)
              }
              error={errors.confirmPassword}
              placeholder="Re-enter password"
              autoComplete="new-password"
              disabled={loading}
            />
          </AuthField>

          <AuthField id="role" label="Primary role" error={errors.role}>
            <RoleSelector
              id="role"
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              error={errors.role}
              disabled={loading}
            />
          </AuthField>

          <div>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(event) => updateField('terms', event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => showToast('Terms of Service will be available in the full product.')}
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => showToast('Privacy Policy will be available in the full product.')}
                  className="font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1.5 text-sm text-red-600">{errors.terms}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className={primaryButtonClass}>
            {loading ? (
              <>
                <Spinner />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
