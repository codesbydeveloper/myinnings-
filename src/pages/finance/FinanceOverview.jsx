import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import SectionCard from '../../components/dashboard/SectionCard'
import StatusBadge from '../../components/dashboard/StatusBadge'
import FinanceSummaryCards from '../../components/finance/FinanceSummaryCards'
import { FinancePageSkeleton } from '../../components/finance/FinanceSkeletons'
import PaymentList from '../../components/finance/PaymentList'
import RecordPaymentModal from '../../components/finance/RecordPaymentModal'
import TeamFinanceSummary from '../../components/finance/TeamFinanceSummary'
import TournamentFinance from '../../components/finance/TournamentFinance'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { formatINR, simulateRequest } from '../../utils/helpers'
import { ROLES, TOURNAMENT_WIP } from '../../utils/constants'
import {
  canCreatePayment,
  canRecordPayment,
  canViewTeamFinance,
  canViewTournamentFinance,
} from '../../utils/financeAccess'
import { getVisibleTeams } from '../../utils/teamAccess'

export default function FinanceOverview() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { teams, players } = useTeams()
  const { tournaments } = useTournaments()
  const {
    payments,
    expenses,
    ledger,
    summary,
    effectiveStatus,
    recordPayment,
    getTeamSummary,
    getTournamentSummary,
  } = useFinance()
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [user?.id])

  const player = user?.role === ROLES.PLAYER
  const pending = payments.filter((item) =>
    ['Pending', 'Overdue', 'Pending Review'].includes(effectiveStatus(item)),
  )
  const paid = payments.filter((item) => effectiveStatus(item) === 'Paid')
  const recentExpenses = [...expenses]
    .sort((a, b) => String(b.dateKey || '').localeCompare(String(a.dateKey || '')))
    .slice(0, 5)
  const recentLedger = [...ledger].reverse().slice(0, 6)

  const visibleTeams = useMemo(
    () =>
      getVisibleTeams(teams, players, user).filter(
        (team) => canViewTeamFinance(team, user) || user?.role === ROLES.ADMIN,
      ),
    [players, teams, user],
  )

  async function confirmRecord({ method, reference }) {
    await simulateRequest(280)
    recordPayment(recording.id, { method, reference })
    setRecording(null)
    showToast('Payment recorded successfully. No real money was processed.')
  }

  if (loading) return <FinancePageSkeleton />

  if (player) {
    return (
      <div className="space-y-5">
        <FinanceSummaryCards variant="player" summary={summary} />
        <SectionCard title="Pending Contributions">
          {pending.length ? (
            <PaymentList payments={pending} statusOf={effectiveStatus} />
          ) : (
            <EmptyDashboardState
              icon="check"
              title="No Pending Payments"
              description="All current payments have been completed."
            />
          )}
        </SectionCard>
        <SectionCard
          title="Payment History"
          action={
            <Link to="/finance/payments" className="text-sm font-semibold text-emerald-700">
              View All
            </Link>
          }
        >
          {paid.length ? (
            <PaymentList payments={paid.slice(0, 8)} statusOf={effectiveStatus} />
          ) : (
            <EmptyDashboardState
              icon="finance"
              title="No payment records found."
              description="Completed payments will appear here after they are recorded."
            />
          )}
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <FinanceSummaryCards
        variant={user?.role === ROLES.ORGANIZER && !TOURNAMENT_WIP ? 'tournament' : 'default'}
        summary={summary}
      />

      {user?.role !== ROLES.ORGANIZER && visibleTeams.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleTeams.slice(0, 2).map((team) => (
            <TeamFinanceSummary key={team.id} team={team} summary={getTeamSummary(team)} compact />
          ))}
        </div>
      ) : null}

      {canViewTournamentFinance(user) && !TOURNAMENT_WIP ? (
        <SectionCard title="Tournament Financial Records">
          <div className="space-y-8">
            {tournaments.slice(0, 2).map((tournament) => (
              <div key={tournament.id}>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">{tournament.name}</h3>
                <TournamentFinance
                  tournament={tournament}
                  payments={payments.filter((item) => item.tournamentId === tournament.id)}
                  expenses={expenses.filter((item) => item.tournamentId === tournament.id)}
                  summary={getTournamentSummary(tournament)}
                  statusOf={effectiveStatus}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Recent Transactions"
        action={
          <Link to="/finance/ledger" className="text-sm font-semibold text-emerald-700">
            View All
          </Link>
        }
      >
        {recentLedger.length ? (
          <ul className="divide-y divide-slate-100">
            {recentLedger.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs text-slate-500">
                    {item.relatedEntity} · {item.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${item.income ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {item.income ? `+ ${formatINR(item.income)}` : `- ${formatINR(item.expense)}`}
                  </p>
                  <StatusBadge status={item.income ? 'Paid' : 'Expense'} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyDashboardState
            icon="finance"
            title="No transactions yet"
            description="Payments and expenses will appear here as they are recorded."
          />
        )}
      </SectionCard>

      <SectionCard
        title="Pending Payments"
        action={
          <Link to="/finance/payments" className="text-sm font-semibold text-emerald-700">
            View All
          </Link>
        }
      >
        {pending.length ? (
          <PaymentList
            payments={pending.slice(0, 6)}
            statusOf={effectiveStatus}
            canRecord={canRecordPayment(user)}
            onRecord={setRecording}
          />
        ) : (
          <EmptyDashboardState
            icon="check"
            title="No Pending Payments"
            description="All current payments have been completed."
            actionLabel={canCreatePayment(user) ? 'Create Payment Record' : undefined}
            to={canCreatePayment(user) ? '/finance/payments' : undefined}
          />
        )}
      </SectionCard>

      <SectionCard
        title="Recent Expenses"
        action={
          <Link to="/finance/expenses" className="text-sm font-semibold text-emerald-700">
            View All
          </Link>
        }
      >
        {recentExpenses.length ? (
          <ul className="divide-y divide-slate-100">
            {recentExpenses.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{item.description}</p>
                  <p className="text-xs text-slate-500">
                    {item.matchTitle || item.tournamentName || item.teamName || 'General'} · {item.date}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatINR(item.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyDashboardState
            icon="finance"
            title="No Expenses"
            description="No expenses have been recorded yet."
          />
        )}
      </SectionCard>

      {recording ? (
        <RecordPaymentModal payment={recording} onClose={() => setRecording(null)} onConfirm={confirmRecord} />
      ) : null}
    </div>
  )
}
