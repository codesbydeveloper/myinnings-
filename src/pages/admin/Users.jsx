import ResourcePage from '../../components/common/ResourcePage'
import StatusBadge from '../../components/dashboard/StatusBadge'
import UserAvatar from '../../components/common/UserAvatar'
import { PLATFORM_USERS } from '../../data/users'
import { DEMO_USERS } from '../../utils/constants'

export default function Users() {
  const demoIds = new Set(DEMO_USERS.map((user) => user.id))
  const users = [
    ...DEMO_USERS.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    })),
    ...PLATFORM_USERS.filter((user) => !demoIds.has(user.id)),
  ]

  return (
    <ResourcePage pathname="/users">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {users.map((user) => (
            <li
              key={`${user.id}-${user.email}`}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <StatusBadge status={user.role} />
                {demoIds.has(user.id) ? (
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Demo access
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ResourcePage>
  )
}
