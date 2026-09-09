import SectionCard from '../dashboard/SectionCard'
import StatusBadge from '../dashboard/StatusBadge'
import UserAvatar from '../common/UserAvatar'
import ProgressBar from '../dashboard/ProgressBar'
import { ROLES } from '../../utils/constants'

const GROUPS = [
  { key: 'Available', title: 'Available' },
  { key: 'Not Available', title: 'Not Available' },
  { key: 'Pending', title: 'Pending Response' },
]

export default function TeamAvailability({ team, roster, user, upcomingMatch }) {
  const statusOf = (player) =>
    upcomingMatch?.availability?.[player.id] || player.availability || 'Pending'
  const available = roster.filter((player) => statusOf(player) === 'Available').length
  const isPlayer = user?.role === ROLES.PLAYER
  const own = roster.find((player) => player.name === user?.name)

  return (
    <SectionCard title="Team Availability">
      {upcomingMatch ? (
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">
            {upcomingMatch.home} vs {upcomingMatch.away}
          </p>
          <p className="mt-1 text-sm text-slate-500">{upcomingMatch.date}</p>
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">Available Players</span>
              <span className="font-semibold text-slate-800">
                {available} / {roster.length}
              </span>
            </div>
            <ProgressBar value={available} total={roster.length || 1} />
          </div>
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-500">
          No upcoming match is scheduled for {team.name} yet.
        </p>
      )}

      {isPlayer && own ? (
        <div className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
          <p className="text-sm font-medium text-slate-800">Your availability</p>
          <StatusBadge status={statusOf(own)} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {GROUPS.map((group) => {
            const list = roster.filter((player) => statusOf(player) === group.key)
            return (
              <div key={group.key} className="rounded-xl border border-slate-100 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">{group.title}</p>
                  <span className="text-xs font-medium text-slate-400">{list.length}</span>
                </div>
                {list.length ? (
                  <ul className="space-y-2">
                    {list.map((player) => (
                      <li key={player.id} className="flex items-center gap-2">
                        <UserAvatar name={player.name} className="h-7 w-7 text-[10px]" />
                        <span className="truncate text-sm text-slate-700">{player.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No players in this group.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}
