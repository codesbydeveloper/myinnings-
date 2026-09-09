import { Link } from 'react-router-dom'
import StatusBadge from '../dashboard/StatusBadge'
import UserAvatar from '../common/UserAvatar'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { fieldClass } from '../../utils/helpers'
import { PLAYING_POSITIONS, PLAYER_TEAM_ROLES } from '../../utils/teamAccess'

const compactSelect =
  'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'

export default function TeamRoster({
  players,
  canManage,
  showPayments,
  onAdd,
  onRoleChange,
  onPositionChange,
  onRemove,
}) {
  if (!players.length) {
    return (
      <EmptyDashboardState
        icon="players"
        title="No Players"
        description="This team does not have any players yet."
        actionLabel={canManage ? 'Add Player' : undefined}
        onClick={canManage ? onAdd : undefined}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Availability</th>
              {showPayments ? <th className="px-4 py-3">Payment</th> : null}
              {canManage ? <th className="px-4 py-3 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {players.map((player) => (
              <tr key={player.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={player.name} src={player.avatar} className="h-10 w-10 text-xs" />
                    <div className="min-w-0">
                      <Link
                        to={`/players/${player.id}`}
                        className="block truncate font-semibold text-slate-900 hover:text-emerald-700"
                      >
                        {player.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        {player.teamRole === 'Player' ? player.position : `${player.teamRole} / ${player.position}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {canManage ? (
                    <select
                      className={compactSelect}
                      value={player.teamRole}
                      onChange={(event) => onRoleChange(player, event.target.value)}
                    >
                      {PLAYER_TEAM_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-700">{player.teamRole}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {canManage ? (
                    <select
                      className={compactSelect}
                      value={player.position}
                      onChange={(event) => onPositionChange(player, event.target.value)}
                    >
                      {PLAYING_POSITIONS.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-700">{player.position}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={player.availability} />
                </td>
                {showPayments ? (
                  <td className="px-4 py-3">
                    <StatusBadge status={player.paymentStatus} />
                  </td>
                ) : null}
                {canManage ? (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemove(player)}
                      className="text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {players.map((player) => (
          <li key={player.id} className="p-4">
            <div className="flex items-start gap-3">
              <UserAvatar name={player.name} src={player.avatar} className="h-11 w-11 text-xs" />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/players/${player.id}`}
                  className="block truncate font-semibold text-slate-900 hover:text-emerald-700"
                >
                  {player.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate-500">
                  {player.teamRole} · {player.position}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={player.availability} />
                  {showPayments ? <StatusBadge status={player.paymentStatus} /> : null}
                </div>
              </div>
            </div>
            {canManage ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  className={fieldClass}
                  value={player.teamRole}
                  onChange={(event) => onRoleChange(player, event.target.value)}
                >
                  {PLAYER_TEAM_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  className={fieldClass}
                  value={player.position}
                  onChange={(event) => onPositionChange(player, event.target.value)}
                >
                  {PLAYING_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemove(player)}
                  className="col-span-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
