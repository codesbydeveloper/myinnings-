import { Link } from 'react-router-dom'
import Icon from '../common/Icons'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { activityIcon, formatRelativeTime } from '../../data/activityModel'

export default function ActivityTimeline({ items = [] }) {
  if (!items.length) {
    return (
      <EmptyDashboardState
        icon="clipboard"
        title="No Activity"
        description="No recent activity yet."
      />
    )
  }

  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Icon name={item.icon || activityIcon(item.category)} className="h-4 w-4" />
            </span>
            {index < items.length - 1 ? <span className="w-px flex-1 bg-slate-200" /> : null}
          </div>
          <div className={`min-w-0 flex-1 ${index < items.length - 1 ? 'pb-5' : ''}`}>
            <p className="text-sm font-semibold text-slate-900">
              {item.emoji ? `${item.emoji} ` : ''}
              {item.title}
            </p>
            <p className="mt-1 text-sm leading-6 break-words text-slate-600">{item.description}</p>
            <p className="mt-1 text-xs text-slate-400">
              {item.actorName ? `${item.actorName} · ` : ''}
              {formatRelativeTime(item.createdAt)}
            </p>
            {item.route ? (
              <Link to={item.route} className="mt-2 inline-flex text-sm font-semibold text-emerald-700">
                View details
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
