import { useState } from 'react'
import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import MatchContributionPanel from '../finance/MatchContributionPanel'
import { fieldClass, formatINR } from '../../utils/helpers'
import { estimatedPerPlayer, totalMatchCost } from '../../data/matchModel'
import { useFinance } from '../../context/FinanceContext'
import { useToast } from '../../context/ToastContext'
import { canCreateMatchContributions } from '../../utils/financeAccess'
import { useAuth } from '../../context/AuthContext'

export default function MatchCosts({ match, canManage, onAdd, onUpdate, onRemove }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const {
    paymentsForMatch,
    replacementDecisions,
    contributionMarks,
    setReplacementDecision,
    createMatchContributionPayments,
  } = useFinance()
  const [form, setForm] = useState({ label: '', amount: '' })
  const costs = match.costs || []
  const total = totalMatchCost(costs)
  const squadSize = match.squad?.snapshot?.length || match.squad?.selectedIds?.length || match.squad?.size || 0
  const perPlayer = estimatedPerPlayer(costs, squadSize)

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {costs.length ? (
          <ul className="divide-y divide-slate-100">
            {costs.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                {canManage ? (
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <input
                      className={fieldClass}
                      value={item.label}
                      onChange={(event) => onUpdate(item.id, { label: event.target.value })}
                    />
                    <input
                      type="number"
                      className={fieldClass}
                      value={item.amount}
                      onChange={(event) => onUpdate(item.id, { amount: Number(event.target.value) })}
                    />
                  </div>
                ) : (
                  <p className="font-medium text-slate-800">
                    {item.label}: {formatINR(item.amount)}
                  </p>
                )}
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4">
            <EmptyDashboardState
              icon="finance"
              title="No match costs yet"
              description="Add ground, umpire, and other expenses for this match."
            />
          </div>
        )}
      </div>

      {canManage ? (
        <form
          className="grid gap-3 rounded-2xl border border-dashed border-slate-200 p-4 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!form.label.trim()) {
              showToast('Enter an expense name.', 'error')
              return
            }
            if (!form.amount || Number(form.amount) <= 0) {
              showToast('Payment amount must be greater than zero.', 'error')
              return
            }
            onAdd({ label: form.label.trim(), amount: Number(form.amount) })
            setForm({ label: '', amount: '' })
            showToast('Expense added.')
          }}
        >
          <input
            className={fieldClass}
            placeholder="Expense name"
            value={form.label}
            onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
          />
          <input
            type="number"
            className={fieldClass}
            placeholder="Amount"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />
          <button type="submit" className="min-h-11 rounded-xl bg-slate-900 text-sm font-semibold text-white">
            Add expense
          </button>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <CostStat label="Total Match Cost" value={formatINR(total)} />
        <CostStat label="Final Squad" value={`${squadSize} Players`} />
        <CostStat label="Estimated Per Player" value={formatINR(Math.round(perPlayer * 100) / 100)} />
      </div>
      <p className="text-xs text-slate-500">
        Estimated Contribution — this is a preview only, not a final payment calculation.
      </p>

      <MatchContributionPanel
        match={match}
        payments={paymentsForMatch(match.id)}
        decisions={replacementDecisions}
        contributionMarked={contributionMarks[match.id]}
        canManage={canManage && canCreateMatchContributions(user)}
        onDecisionChange={(outId, inId, decision) => {
          setReplacementDecision(match.id, outId, inId, decision)
        }}
        onCreate={(participants) => {
          const result = createMatchContributionPayments(match.id, participants)
          if (result.created) {
            showToast(`${result.created} payment record${result.created === 1 ? '' : 's'} created.`)
          } else {
            showToast('No new payment records were created. Confirm participants first.')
          }
        }}
      />
    </div>
  )
}

function CostStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
