import { REGISTER_ROLES } from '../../utils/constants'
import { getFieldClass } from '../../utils/helpers'
import Icon from '../common/Icons'

export default function RoleSelector({
  id = 'role',
  value,
  onChange,
  error,
  disabled = false,
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${getFieldClass(error)} appearance-none pr-10`}
      >
        <option value="">Select your primary role</option>
        {REGISTER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <Icon name="chevronDown" className="h-4 w-4" />
      </span>
    </div>
  )
}
