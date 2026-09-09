import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { formatINR } from '../../utils/helpers'

export default function ExpenseList({
  expenses = [],
  canManage,
  onEdit,
  onDelete,
  emptyAction,
}) {
  if (!expenses.length) {
    return (
      <EmptyDashboardState
        icon="finance"
        title="No Expenses"
        description="No expenses have been recorded yet."
        actionLabel={emptyAction?.label}
        to={emptyAction?.to}
        onClick={emptyAction?.onClick}
      />
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Expense</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Related To</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Created By</th>
              {canManage ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{expense.code}</p>
                  <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{expense.description}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{expense.category}</td>
                <td className="max-w-[200px] px-4 py-3 text-slate-600">
                  <span className="line-clamp-2">{expense.matchTitle || expense.tournamentName || expense.teamName || '—'}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{formatINR(expense.amount)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{expense.date}</td>
                <td className="px-4 py-3 text-slate-600">{expense.createdBy}</td>
                {canManage ? (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button type="button" onClick={() => onEdit(expense)} className="text-sm font-semibold text-emerald-700">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(expense)}
                      className="ml-3 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <li key={expense.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{expense.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {expense.code} · {expense.category}
                </p>
                <p className="mt-1 text-xs break-words text-slate-500">
                  {expense.matchTitle || expense.tournamentName || expense.teamName || expense.date}
                </p>
              </div>
              <p className="text-base font-semibold text-slate-900">{formatINR(expense.amount)}</p>
            </div>
            {canManage ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(expense)}
                  className="min-h-11 flex-1 rounded-xl border border-red-100 text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}
