import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import StatusBadge from '../dashboard/StatusBadge'
import FinanceSummaryCards from './FinanceSummaryCards'
import { formatINR } from '../../utils/helpers'

export default function TournamentFinance({
  tournament,
  payments = [],
  expenses = [],
  summary,
  statusOf,
  canManage,
  onAddExpense,
  onCreateRegistration,
}) {
  const registrations = payments.filter((item) => item.type === 'Tournament Registration')
  const tournamentExpenses = expenses.filter((item) => item.tournamentId === tournament.id)

  return (
    <div className="space-y-5">
      <FinanceSummaryCards
        variant="tournament"
        summary={{
          collected: summary.income,
          pending: summary.pending,
          expenses: summary.expenses,
          net: summary.net,
        }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Tournament Registration Fees</h3>
          {canManage ? (
            <button
              type="button"
              onClick={onCreateRegistration}
              className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Create Registration Payment
            </button>
          ) : null}
        </div>
        {registrations.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {registrations.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{item.teamName}</p>
                  <p className="text-xs text-slate-500">{item.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-900">{formatINR(item.amount)}</p>
                  <StatusBadge status={statusOf(item)} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <EmptyDashboardState
              icon="finance"
              title="No registration payments"
              description="Registration fee records will appear here once they are created."
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Tournament Expenses</h3>
          {canManage ? (
            <button
              type="button"
              onClick={onAddExpense}
              className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              Add Expense
            </button>
          ) : null}
        </div>
        {tournamentExpenses.length ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {tournamentExpenses.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <p className="font-semibold text-slate-900">{formatINR(item.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No tournament expenses have been recorded yet.</p>
        )}
      </section>
    </div>
  )
}
