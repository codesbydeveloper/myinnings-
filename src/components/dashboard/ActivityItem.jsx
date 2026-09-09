import Icon from '../common/Icons'
import { formatRelativeTime } from '../../data/notificationModel'

export default function ActivityItem({ activity }) {
  const title = activity.title
  const text = activity.description || activity.text
  const time = activity.createdAt ? formatRelativeTime(activity.createdAt) : activity.time

  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
        <Icon name={activity.icon || 'clipboard'} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        {title ? <p className="text-sm font-semibold text-slate-800">{title}</p> : null}
        <p className={`text-sm leading-5 text-slate-700 ${title ? 'mt-0.5' : ''}`}>{text}</p>
        <p className="mt-1 text-xs text-slate-400">{time}</p>
      </div>
    </li>
  )
}
