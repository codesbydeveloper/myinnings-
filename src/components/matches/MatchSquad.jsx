import { useState } from 'react'
import { createPortal } from 'react-dom'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import UserAvatar from '../common/UserAvatar'
import StatusBadge from '../dashboard/StatusBadge'

export default function MatchSquad({
  match,
  roster,
  availability,
  canManage,
  onToggle,
  onSize,
  onFinalize,
  onReplace,
}) {
  const [replacing, setReplacing] = useState(null)
  const [warning, setWarning] = useState('')
  const selectedIds = match.squad?.selectedIds || []
  const size = match.squad?.size || 11
  const selected = selectedIds
    .map((id) => roster.find((player) => player.id === id))
    .filter(Boolean)
  const availablePool = roster.filter(
    (player) => (availability[player.id] || player.availability) === 'Available',
  )
  const others = roster.filter((player) => !selectedIds.includes(player.id))

  function handleSelect(player) {
    const status = availability[player.id] || player.availability
    if (status !== 'Available') {
      setWarning(`${player.name} is marked ${status}. Confirm you want to include them anyway.`)
    } else {
      setWarning('')
    }
    if (!selectedIds.includes(player.id) && selectedIds.length >= size) {
      setWarning(`Squad size is limited to ${size} players.`)
      return
    }
    onToggle(player.id)
  }

  if (!roster.length) {
    return (
      <EmptyDashboardState
        icon="players"
        title="No Available Players"
        description="No players are currently available for this match."
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Selected Squad {selected.length} / {size}
          </p>
          {match.squad?.finalized ? (
            <p className="mt-1 text-xs text-emerald-700">
              Finalized {match.squad.finalizedAt ? `on ${match.squad.finalizedAt}` : ''}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">The final squad has not been selected yet.</p>
          )}
        </div>
        {canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Squad size
              <input
                type="number"
                min="8"
                max="15"
                value={size}
                disabled={match.squad?.finalized}
                onChange={(event) => onSize(event.target.value)}
                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </label>
            {!match.squad?.finalized ? (
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={onFinalize}
                className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Finalize Squad
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {warning ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {warning}
        </p>
      ) : null}

      {selected.length === 0 && !canManage ? (
        <EmptyDashboardState
          icon="players"
          title="No Squad Selected"
          description="The final squad has not been selected yet."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              {match.squad?.finalized ? 'Replacement Pool' : 'Available Players'}
            </h3>
            {(canManage ? others : availablePool.filter((p) => !selectedIds.includes(p.id)))
              .length ? (
            <ul className="space-y-2">
              {(canManage ? others : availablePool.filter((p) => !selectedIds.includes(p.id))).map(
                (player) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <UserAvatar name={player.name} src={player.avatar} className="h-9 w-9 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-500">
                        {player.position} · {player.teamRole}
                      </p>
                    </div>
                    <StatusBadge status={availability[player.id] || player.availability} />
                    {canManage && !match.squad?.finalized ? (
                      <button
                        type="button"
                        onClick={() => handleSelect(player)}
                        className="text-sm font-semibold text-emerald-700"
                      >
                        Select
                      </button>
                    ) : null}
                  </li>
                ),
              )}
            </ul>
            ) : (
              <p className="text-sm text-slate-500">
                {match.squad?.finalized
                  ? 'No eligible replacement players remain on this team.'
                  : 'No players are currently available for this match.'}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Selected Squad</h3>
            {selected.length ? (
              <ul className="space-y-2">
                {selected.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2"
                  >
                    <UserAvatar name={player.name} src={player.avatar} className="h-9 w-9 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-500">
                        {player.position} · {player.teamRole}
                      </p>
                    </div>
                    {canManage ? (
                      match.squad?.finalized ? (
                        <button
                          type="button"
                          onClick={() => setReplacing(player)}
                          className="text-sm font-semibold text-amber-700"
                        >
                          Replace
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggle(player.id)}
                          className="text-sm font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      )
                    ) : (
                      <StatusBadge status="Selected" />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No players selected yet.</p>
            )}
          </section>
        </div>
      )}

      {(match.squad?.replacements || []).length ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Squad Change History</h3>
          <ul className="space-y-3">
            {match.squad.replacements.map((item) => (
              <li key={item.id} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {item.outName} <span className="text-red-600">OUT</span>
                </p>
                <p className="my-1 text-xs tracking-[0.2em] text-slate-400">↓</p>
                <p className="text-sm font-semibold text-slate-800">
                  {item.inName} <span className="text-emerald-700">IN</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                <p className="text-xs text-slate-400">{item.at}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {replacing
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                onClick={() => setReplacing(null)}
              />
              <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">Replace {replacing.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {replacing.name} will be marked OUT. The replacement is recorded in squad history.
                </p>
                {others.length ? (
                  <ul className="mt-4 space-y-2">
                    {others.map((player) => {
                      const status = availability[player.id] || player.availability
                      return (
                        <li key={player.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (status !== 'Available') {
                                setWarning(
                                  `${player.name} is marked ${status}. The replacement was still recorded.`,
                                )
                              }
                              onReplace(replacing.id, player.id)
                              setReplacing(null)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
                          >
                            <UserAvatar
                              name={player.name}
                              src={player.avatar}
                              className="h-9 w-9 text-xs"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{player.name}</span>
                              <span className="text-xs text-slate-500">{player.position}</span>
                            </span>
                            <StatusBadge status={status} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No eligible replacement players.</p>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
