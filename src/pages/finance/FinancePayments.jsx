import { useEffect, useMemo, useState } from 'react'
import CreatePaymentModal from '../../components/finance/CreatePaymentModal'
import FinanceFilters from '../../components/finance/FinanceFilters'
import { FinanceListSkeleton } from '../../components/finance/FinanceSkeletons'
import PaymentList from '../../components/finance/PaymentList'
import RecordPaymentModal from '../../components/finance/RecordPaymentModal'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { matchesDateFilter, paymentSearchText } from '../../data/financeModel'
import { simulateRequest } from '../../utils/helpers'
import { ROLES } from '../../utils/constants'
import { canCreatePayment, canRecordPayment } from '../../utils/financeAccess'
import { getVisibleMatches } from '../../utils/matchAccess'
import { getVisiblePlayers } from '../../utils/playerAccess'
import { getVisibleTeams } from '../../utils/teamAccess'

const EMPTY_FILTERS = { status: 'all', type: 'all', date: 'all' }

export default function FinancePayments() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { payments, effectiveStatus, createPayment, recordPayment } = useFinance()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)
  const [recording, setRecording] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(timer)
  }, [user?.id])

  const visiblePlayers = getVisiblePlayers(players, teams, user)
  const visibleTeams = getVisibleTeams(teams, players, user)
  const visibleMatches = getVisibleMatches(matches, user, teams, players)
  const canCreate = canCreatePayment(user)
  const canRecord = canRecordPayment(user) && user?.role !== ROLES.PLAYER

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return payments.filter((item) => {
      const status = effectiveStatus(item)
      if (filters.status !== 'all' && status !== filters.status) return false
      if (filters.type !== 'all' && item.type !== filters.type) return false
      const dateKey = item.paidDateKey || item.dueDateKey || item.createdDateKey
      if (!matchesDateFilter(dateKey, filters.date)) return false
      if (needle && !paymentSearchText(item).includes(needle)) return false
      return true
    })
  }, [effectiveStatus, filters, payments, query])

  const activeCount = [filters.status, filters.type, filters.date].filter((value) => value !== 'all').length + (query ? 1 : 0)

  async function handleCreate(payload) {
    const record = createPayment(payload)
    setCreateOpen(false)
    if (!record) {
      showToast('You do not have permission to create this payment.', 'error')
      return
    }
    showToast('Payment record created.')
  }

  async function confirmRecord({ method, reference }) {
    await simulateRequest(280)
    recordPayment(recording.id, { method, reference })
    setRecording(null)
    showToast('Payment recorded successfully. No real money was processed.')
  }

  if (loading) return <FinanceListSkeleton rows={6} />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{filtered.length} payment records</p>
        {canCreate ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Create Payment Record
          </button>
        ) : null}
      </div>

      <FinanceFilters
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by player, team, match, or payment ID"
        filters={filters}
        onChange={setFilters}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
        }}
        activeCount={activeCount}
        showStatus
        showType
        showDate
      />

      <PaymentList
        payments={filtered}
        statusOf={effectiveStatus}
        canRecord={canRecord}
        onRecord={setRecording}
        emptyAction={
          canCreate
            ? { label: 'Create Payment Record', onClick: () => setCreateOpen(true) }
            : undefined
        }
      />

      <CreatePaymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        players={visiblePlayers}
        teams={visibleTeams}
        matches={visibleMatches}
        tournaments={tournaments}
        role={user?.role}
      />

      {recording ? (
        <RecordPaymentModal payment={recording} onClose={() => setRecording(null)} onConfirm={confirmRecord} />
      ) : null}
    </div>
  )
}
