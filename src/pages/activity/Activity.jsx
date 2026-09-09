import { useState } from 'react'
import ActivityTimeline from '../../components/activity/ActivityTimeline'
import { useActivity } from '../../context/ActivityContext'
import { ACTIVITY_FILTERS, matchesActivityFilter } from '../../data/activityModel'

export default function Activity() {
  const { activities } = useActivity()
  const [filter, setFilter] = useState('all')
  const items = activities.filter((item) => matchesActivityFilter(item, filter))

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Activity</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Track recent activity across MyInnings.
        </p>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2">
          {ACTIVITY_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold whitespace-nowrap ${
                filter === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ActivityTimeline items={items} />
      </section>
    </div>
  )
}
