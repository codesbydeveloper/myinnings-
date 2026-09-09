import { useEffect, useMemo, useState } from 'react'
import AccessRestricted from '../../components/common/AccessRestricted'
import ConfirmModal from '../../components/common/ConfirmModal'
import ExpenseFormModal from '../../components/finance/ExpenseFormModal'
import ExpenseList from '../../components/finance/ExpenseList'
import FinanceFilters from '../../components/finance/FinanceFilters'
import { FinanceListSkeleton } from '../../components/finance/FinanceSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { expenseSearchText, matchesDateFilter } from '../../data/financeModel'
import { EXPENSE_CATEGORIES, canManageExpenses, canViewExpenses } from '../../utils/financeAccess'
import { getVisibleMatches } from '../../utils/matchAccess'

const EMPTY_FILTERS = { status: 'all', type: 'all', date: 'all', category: 'all' }

export default function FinanceExpenses() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { expenses, createExpense, updateExpense, deleteExpense } = useFinance()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(timer)
  }, [user?.id])

  const allowed = canViewExpenses(user)
  const canManage = canManageExpenses(user)
  const visibleMatches = getVisibleMatches(matches, user, teams, players)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return expenses.filter((item) => {
      if (filters.category !== 'all' && item.category !== filters.category) return false
      if (!matchesDateFilter(item.dateKey, filters.date)) return false
      if (needle && !expenseSearchText(item).includes(needle)) return false
      return true
    })
  }, [expenses, filters, query])

  const activeCount =
    [filters.category, filters.date].filter((value) => value !== 'all').length + (query ? 1 : 0)

  if (loading) return <FinanceListSkeleton />

  if (!allowed) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="Players can view only their own payment records. Expense management is not available on this account."
        to="/finance"
        actionLabel="Back to My Payments"
      />
    )
  }

  function handleSave(payload) {
    if (editing) {
      updateExpense(editing, payload)
      showToast('Expense updated.')
    } else {
      const result = createExpense(payload)
      if (!result) {
        showToast('You do not have permission to add this expense.', 'error')
        return
      }
      showToast('Expense added.')
    }
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{filtered.length} expenses</p>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Add Expense
          </button>
        ) : null}
      </div>

      <FinanceFilters
        query={query}
        onQueryChange={setQuery}
        placeholder="Search expenses, matches, or tournaments"
        filters={filters}
        onChange={setFilters}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
        }}
        activeCount={activeCount}
        showDate
        extra={
          <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Category
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={filters.category}
              onChange={(event) => setFilters({ ...filters, category: event.target.value })}
            >
              <option value="all">All</option>
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <ExpenseList
        expenses={filtered}
        canManage={canManage}
        onEdit={(item) => {
          setEditing(item)
          setFormOpen(true)
        }}
        onDelete={setRemoving}
        emptyAction={
          canManage ? { label: 'Add Expense', onClick: () => setFormOpen(true) } : undefined
        }
      />

      <ExpenseFormModal
        open={formOpen}
        expense={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
        matches={visibleMatches}
        tournaments={tournaments}
        role={user?.role}
      />

      <ConfirmModal
        open={Boolean(removing)}
        title={`Delete ${removing?.description || 'this expense'}?`}
        description="This removes the expense from financial totals. Match-linked expenses are also removed from the match."
        confirmLabel="Delete Expense"
        icon="alert"
        variant="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          deleteExpense(removing)
          setRemoving(null)
          showToast('Expense deleted.')
        }}
      />
    </div>
  )
}
