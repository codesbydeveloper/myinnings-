import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import Icon from '../../components/common/Icons'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import TournamentBracket from '../../components/tournaments/TournamentBracket'
import TournamentFixtures from '../../components/tournaments/TournamentFixtures'
import TournamentLogo from '../../components/tournaments/TournamentLogo'
import TournamentOverview from '../../components/tournaments/TournamentOverview'
import TournamentResults from '../../components/tournaments/TournamentResults'
import TournamentStandings from '../../components/tournaments/TournamentStandings'
import TournamentStats from '../../components/tournaments/TournamentStats'
import TournamentTeams from '../../components/tournaments/TournamentTeams'
import TournamentFinance from '../../components/finance/TournamentFinance'
import TournamentGrounds from '../../components/grounds/TournamentGrounds'
import CreatePaymentModal from '../../components/finance/CreatePaymentModal'
import ExpenseFormModal from '../../components/finance/ExpenseFormModal'
import { TournamentDetailsSkeleton } from '../../components/tournaments/TournamentSkeletons'
import TeamLogo from '../../components/teams/TeamLogo'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { useFinance } from '../../context/FinanceContext'
import { useGrounds } from '../../context/GroundContext'
import { approvedRegistrations, snapshotGround } from '../../data/tournamentModel'
import { fieldClass } from '../../utils/helpers'
import {
  canApproveRegistrations,
  canCompleteTournament,
  canEditTournament,
  canGenerateFixtures,
  canRegisterForTournament,
  getRegistrableTeams,
} from '../../utils/tournamentAccess'
import { canManageExpenses, canViewTournamentFinance } from '../../utils/financeAccess'
import { canAssignTournamentGrounds } from '../../utils/groundAccess'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'teams', label: 'Teams' },
  { id: 'grounds', label: 'Grounds' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'standings', label: 'Standings' },
  { id: 'results', label: 'Results' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'finance', label: 'Finance' },
]

export default function TournamentDetails() {
  const { tournamentId } = useParams()
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const {
    getTournament,
    registerTeam,
    approveTeam,
    rejectTeam,
    generateFixtures,
    setTournamentStatus,
    completeTournament,
    updateTournament,
  } = useTournaments()
  const { grounds, availabilityOf } = useGrounds()
  const {
    payments,
    expenses,
    effectiveStatus,
    getTournamentSummary,
    createPayment,
    createExpense,
  } = useFinance()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [rejectItem, setRejectItem] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [groundDraft, setGroundDraft] = useState({ id: '', ids: null })
  const [groundSaving, setGroundSaving] = useState(false)

  const tournament = getTournament(tournamentId)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [tournamentId])

  const tab = TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'overview'

  function setTab(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  if (loading) return <TournamentDetailsSkeleton />

  if (!tournament) {
    return (
      <EmptyDashboardState
        icon="tournaments"
        title="Tournament not found"
        description="This tournament is unavailable."
        actionLabel="Back to Tournaments"
        to="/tournaments"
      />
    )
  }

  const approved = approvedRegistrations(tournament).length
  const canEdit = canEditTournament(tournament, user)
  const selectedGroundIds =
    groundDraft.id === tournament.id && Array.isArray(groundDraft.ids)
      ? groundDraft.ids
      : tournament.groundIds || []
  const canApprove = canApproveRegistrations(tournament, user)
  const canGenerate = canGenerateFixtures(tournament, user) && !(tournament.fixtureMatchIds || []).length
  const canRegister = getRegistrableTeams(teams, players, user, tournament).length > 0
  const showStandings = tournament.format !== 'Knockout'
  const showBracket = tournament.format !== 'League'
  const showFinance = canViewTournamentFinance(user)
  const visibleTabs = TABS.filter((item) => item.id !== 'finance' || showFinance)
  const activeTab = visibleTabs.some((item) => item.id === tab) ? tab : 'overview'

  async function handleGenerate() {
    const result = generateFixtures(tournament.id)
    setGenerateOpen(false)
    if (!result.ok) {
      showToast(result.message)
      return
    }
    showToast('Fixtures generated successfully.')
    setTab('fixtures')
  }

  return (
    <div className="space-y-6">
      <Link to="/tournaments" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        Back to Tournaments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <TournamentLogo tournament={tournament} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{tournament.name}</h1>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{tournament.location}</p>
            <p className="mt-3 text-sm font-medium text-slate-700">{tournament.format}</p>
            <p className="mt-1 text-sm text-slate-600">
              {approved} / {tournament.maxTeams} Teams
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {tournament.startDate} – {tournament.endDate}
            </p>
          </div>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap ${
                activeTab === item.id
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <TournamentOverview
          tournament={tournament}
          canEdit={canEdit}
          canComplete={canCompleteTournament(tournament, user)}
          approvedCount={approved}
          onStatus={(status) => {
            setTournamentStatus(tournament.id, status)
            showToast(`Tournament marked as ${status}.`)
          }}
          onGenerate={() => setGenerateOpen(true)}
          onComplete={() => setCompleteOpen(true)}
        />
      ) : null}

      {activeTab === 'teams' ? (
        <TournamentTeams
          tournament={tournament}
          teams={teams}
          canApprove={canApprove}
          canRegister={canRegister && canRegisterForTournament(tournament, user)}
          onRegister={() => {
            const options = getRegistrableTeams(teams, players, user, tournament)
            setSelectedTeam(options[0]?.id || '')
            setRegisterOpen(true)
          }}
          onApprove={(item) => {
            const result = approveTeam(tournament.id, item.id)
            showToast(result.ok ? `${item.teamName} approved.` : result.message)
          }}
          onReject={(item) => {
            setRejectItem(item)
            setRejectReason('')
          }}
        />
      ) : null}

      {activeTab === 'grounds' ? (
        <TournamentGrounds
          tournament={tournament}
          grounds={grounds}
          availabilityOf={availabilityOf}
          canManage={canAssignTournamentGrounds(user) && canEdit}
          selectedIds={selectedGroundIds}
          onToggle={(id) =>
            setGroundDraft({
              id: tournament.id,
              ids: selectedGroundIds.includes(id)
                ? selectedGroundIds.filter((item) => item !== id)
                : [...selectedGroundIds, id],
            })
          }
          onSave={async () => {
            const selected = grounds.filter((item) => selectedGroundIds.includes(item.id))
            setGroundSaving(true)
            updateTournament(tournament.id, {
              groundIds: selectedGroundIds,
              grounds: selected.map((item) => snapshotGround(item)),
              defaultGround: selected[0]?.name || tournament.defaultGround,
            })
            setGroundSaving(false)
            showToast('Tournament grounds updated.')
          }}
          saving={groundSaving}
        />
      ) : null}

      {activeTab === 'fixtures' ? (
        <TournamentFixtures
          tournament={tournament}
          matches={matches}
          canGenerate={canGenerate}
          onGenerate={() => setGenerateOpen(true)}
        />
      ) : null}

      {activeTab === 'standings' ? (
        <div className="space-y-6">
          {showStandings ? (
            <TournamentStandings tournament={tournament} teams={teams} matches={matches} />
          ) : null}
          {showBracket ? <TournamentBracket tournament={tournament} matches={matches} /> : null}
        </div>
      ) : null}

      {activeTab === 'results' ? <TournamentResults tournament={tournament} matches={matches} /> : null}
      {activeTab === 'statistics' ? (
        <TournamentStats tournament={tournament} teams={teams} matches={matches} />
      ) : null}

      {activeTab === 'finance' && showFinance ? (
        <TournamentFinance
          tournament={tournament}
          payments={payments.filter((item) => item.tournamentId === tournament.id)}
          expenses={expenses.filter((item) => item.tournamentId === tournament.id)}
          summary={getTournamentSummary(tournament)}
          statusOf={effectiveStatus}
          canManage={canManageExpenses(user)}
          onAddExpense={() => setExpenseOpen(true)}
          onCreateRegistration={() => setPayOpen(true)}
        />
      ) : null}

      <ConfirmModal
        open={generateOpen}
        title="Generate fixtures?"
        description={`Approved Teams: ${approved}. Tournament Format: ${tournament.format}. This will create tournament matches.`}
        confirmLabel="Generate Fixtures"
        icon="check"
        variant="dark"
        onCancel={() => setGenerateOpen(false)}
        onConfirm={handleGenerate}
      />

      <ConfirmModal
        open={completeOpen}
        title="Complete this tournament?"
        description={
          tournament.winner
            ? `${tournament.winner} will remain listed as the tournament winner.`
            : 'The current leader or final winner will be stored as the tournament champion.'
        }
        confirmLabel="Complete Tournament"
        icon="check"
        variant="dark"
        onCancel={() => setCompleteOpen(false)}
        onConfirm={() => {
          const result = completeTournament(tournament.id)
          setCompleteOpen(false)
          if (result.ok) showToast(`Tournament completed. Winner: ${result.winner || 'TBD'}.`)
        }}
      />

      {registerOpen
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
              <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={() => setRegisterOpen(false)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">Register Team</h3>
                <div className="mt-4 space-y-2">
                  {getRegistrableTeams(teams, players, user, tournament).map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedTeam(team.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left ${
                        selectedTeam === team.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      <TeamLogo team={team} size="sm" />
                      <span>
                        <span className="block font-semibold text-slate-900">{team.name}</span>
                        <span className="text-xs text-slate-500">
                          Captain {team.captain} · {team.players} players
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRegisterOpen(false)} className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const result = registerTeam(tournament.id, selectedTeam)
                      setRegisterOpen(false)
                      showToast(result.ok ? 'Registration submitted. Status: Pending Approval.' : result.message)
                    }}
                    className="min-h-11 rounded-xl bg-emerald-600 text-sm font-semibold text-white"
                  >
                    Submit Registration
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {rejectItem
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
              <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={() => setRejectItem(null)} />
              <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">Reject {rejectItem.teamName}?</h3>
                <textarea
                  className={`mt-3 ${fieldClass}`}
                  rows={3}
                  placeholder="Rejection reason (optional)"
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRejectItem(null)} className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold">
                    Keep Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      rejectTeam(tournament.id, rejectItem.id, rejectReason.trim())
                      setRejectItem(null)
                      showToast(`${rejectItem.teamName} was rejected.`)
                    }}
                    className="min-h-11 rounded-xl bg-red-600 text-sm font-semibold text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <CreatePaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSave={(payload) => {
          const record = createPayment({
            ...payload,
            type: 'Tournament Registration',
            tournamentId: tournament.id,
          })
          setPayOpen(false)
          showToast(record ? 'Registration payment recorded.' : 'Unable to create this payment.')
        }}
        teams={teams}
        matches={matches.filter((item) => item.tournamentId === tournament.id)}
        tournaments={[tournament]}
        role={user?.role}
      />

      <ExpenseFormModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSave={(payload) => {
          const result = createExpense({
            ...payload,
            tournamentId: payload.tournamentId || tournament.id,
          })
          setExpenseOpen(false)
          showToast(result ? 'Tournament expense added.' : 'Unable to add this expense.')
        }}
        matches={matches.filter((item) => item.tournamentId === tournament.id)}
        tournaments={[tournament]}
        role={user?.role}
      />
    </div>
  )
}
