import { useMemo, useState } from 'react'
import StatusBadge from '../dashboard/StatusBadge'
import UserAvatar from '../common/UserAvatar'
import { fieldClass, formatINR } from '../../utils/helpers'
import { REPLACEMENT_DECISIONS } from '../../utils/financeAccess'
import { replacementDecisionKey } from '../../data/financeModel'
import { estimatedPerPlayer } from '../../data/matchModel'

export default function MatchContributionPanel({
  match,
  payments = [],
  decisions = {},
  contributionMarked,
  canManage,
  onDecisionChange,
  onCreate,
}) {
  const squadSize = match.squad?.snapshot?.length || match.squad?.selectedIds?.length || 0
  const amount = Math.round(estimatedPerPlayer(match.costs, squadSize) * 100) / 100
  const replacements = useMemo(() => match.squad?.replacements || [], [match.squad])
  const participants = useMemo(() => match.participants || [], [match.participants])
  const existingIds = useMemo(
    () => new Set(payments.filter((item) => item.status !== 'Cancelled').map((item) => item.playerId)),
    [payments],
  )

  const initialSelected = useMemo(() => {
    const next = {}
    participants.forEach((item) => {
      if (existingIds.has(item.playerId)) {
        next[item.playerId] = false
        return
      }
      if (item.status === 'Included' && !item.replacementFor) next[item.playerId] = true
      else next[item.playerId] = false
    })
    replacements.forEach((swap) => {
      const key = replacementDecisionKey(match.id, swap.outPlayerId, swap.inPlayerId)
      const decision = decisions[key] || 'review'
      if (decision === 'original') {
        next[swap.outPlayerId] = !existingIds.has(swap.outPlayerId)
        next[swap.inPlayerId] = false
      } else if (decision === 'replacement') {
        next[swap.outPlayerId] = false
        next[swap.inPlayerId] = !existingIds.has(swap.inPlayerId)
      } else {
        next[swap.outPlayerId] = false
        next[swap.inPlayerId] = false
      }
    })
    return next
  }, [decisions, existingIds, match.id, participants, replacements])

  const [flipped, setFlipped] = useState({})

  function isSelected(playerId) {
    const base = Boolean(initialSelected[playerId])
    return playerId in flipped ? flipped[playerId] : base
  }

  function toggle(playerId) {
    setFlipped((current) => {
      const base = Boolean(initialSelected[playerId])
      const currentValue = playerId in current ? current[playerId] : base
      return { ...current, [playerId]: !currentValue }
    })
  }

  function handleCreate() {
    const payload = participants.map((item) => ({
      playerId: item.playerId,
      name: item.name,
      status: item.status === 'Replaced' || item.status === 'Pending Review' ? 'Pending Review' : 'Pending',
      include: isSelected(item.playerId),
      note: item.replacedBy ? `Replaced by ${item.replacedBy}` : item.replacementFor ? `Replacement for ${item.replacementFor}` : '',
    }))
    onCreate(payload)
  }

  if (!match.squad?.finalized) {
    return (
      <p className="text-sm text-slate-500">Finalize a squad before creating match contribution records.</p>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-800">Payment Participants</h3>
      <p className="mt-1 text-xs text-slate-500">
        Confirm participants before creating records. Do not assume every player must pay, especially after a replacement.
      </p>

      {replacements.length ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Squad Replacements</p>
          {replacements.map((swap) => {
            const key = replacementDecisionKey(match.id, swap.outPlayerId, swap.inPlayerId)
            return (
              <div key={key} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Original Player</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{swap.outName}</p>
                    <StatusBadge status="Replaced" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Replacement Player</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{swap.inName}</p>
                    <StatusBadge status="Included" />
                  </div>
                </div>
                {canManage ? (
                  <label className="mt-3 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Who is financially responsible?
                    <select
                      className={`mt-1.5 ${fieldClass}`}
                      value={decisions[key] || 'review'}
                      onChange={(event) => onDecisionChange(swap.outPlayerId, swap.inPlayerId, event.target.value)}
                    >
                      {REPLACEMENT_DECISIONS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">Financial responsibility is pending review.</p>
                )}
              </div>
            )
          })}
        </div>
      ) : null}

      <ul className="mt-4 space-y-3">
        {participants.map((item) => {
          const already = existingIds.has(item.playerId)
          return (
            <li key={`${item.playerId}-${item.status}`} className="flex items-center gap-3">
              {canManage ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-600"
                  checked={isSelected(item.playerId)}
                  disabled={already}
                  onChange={() => toggle(item.playerId)}
                />
              ) : (
                <span className="w-4" />
              )}
              <UserAvatar name={item.name} className="h-9 w-9 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">
                  {already
                    ? 'Payment record already exists'
                    : item.replacedBy
                      ? `Replaced by ${item.replacedBy}`
                      : item.replacementFor
                        ? `Replacement for ${item.replacementFor}`
                        : 'Squad member'}
                </p>
              </div>
              <StatusBadge status={item.status} />
              <span className="text-sm font-semibold text-slate-700">
                {item.status === 'Included' ? formatINR(amount) : 'Pending Review'}
              </span>
            </li>
          )
        })}
      </ul>

      {canManage ? (
        <button
          type="button"
          onClick={handleCreate}
          className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white sm:w-auto sm:px-5"
        >
          Create payment records for confirmed participants
        </button>
      ) : null}
      {contributionMarked ? (
        <p className="mt-2 text-xs text-emerald-700">Payment records were last created {contributionMarked}.</p>
      ) : null}
    </section>
  )
}
