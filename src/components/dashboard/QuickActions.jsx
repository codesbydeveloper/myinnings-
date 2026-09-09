import { Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import Icon from '../common/Icons'
import SectionCard from './SectionCard'

export default function QuickActions({ actions = [] }) {
  const { showToast } = useToast()

  return (
    <SectionCard title="Quick Actions">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const className =
            'flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'

          const content = (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                <Icon name={action.icon} className="h-4 w-4" />
              </span>
              {action.label}
            </>
          )

          if (action.comingSoon || !action.to) {
            return (
              <button
                key={action.label}
                type="button"
                className={className}
                onClick={() => showToast('This feature is coming soon.')}
              >
                {content}
              </button>
            )
          }

          return (
            <Link key={action.label} to={action.to} className={className}>
              {content}
            </Link>
          )
        })}
      </div>
    </SectionCard>
  )
}
