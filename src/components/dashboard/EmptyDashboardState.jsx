import { Link } from 'react-router-dom'
import Icon from '../common/Icons'

const actionClass =
  'mt-4 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500'

export default function EmptyDashboardState({
  icon = 'matches',
  title,
  description,
  actionLabel,
  to,
  onClick,
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {actionLabel && to ? (
        <Link to={to} className={actionClass}>
          {actionLabel}
        </Link>
      ) : actionLabel && onClick ? (
        <button type="button" onClick={onClick} className={actionClass}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
