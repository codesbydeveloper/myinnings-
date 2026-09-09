import { useEffect, useMemo, useState } from 'react'
import AccessRestricted from '../../components/common/AccessRestricted'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import FinanceFilters from '../../components/finance/FinanceFilters'
import { FinanceLedgerSkeleton } from '../../components/finance/FinanceSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useTournaments } from '../../context/TournamentContext'
import { ledgerSearchText, matchesDateFilter } from '../../data/financeModel'
import { formatINR } from '../../utils/helpers'
import { ROLES } from '../../utils/constants'
import { LEDGER_TYPES, canViewFullLedger } from '../../utils/financeAccess'
import { getVisibleMatches } from '../../utils/matchAccess'
import { getVisibleTeams } from '../../utils/teamAccess'

const EMPTY_FILTERS = { status: 'all', type: 'all', date: 'all', team: 'all', match: 'all', tournament: 'all' }

export default function FinanceLedger() {
  const { user } = useAuth()
  const { teams, players } = useTeams()
  const { matches } = useMatches()
  const { tournaments } = useTournaments()
  const { ledger } = useFinance()
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(timer)
  }, [user?.id])

  const allowed = canViewFullLedger(user)
  const visibleTeams = getVisibleTeams(teams, players, user)
  const visibleMatches = getVisibleMatches(matches, user, teams, players)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return ledger.filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) return false
      if (filters.team !== 'all' && item.teamId !== filters.team && item.teamName !== filters.team) return false
      if (filters.match !== 'all' && item.matchId !== filters.match) return false
      if (filters.tournament !== 'all' && item.tournamentId !== filters.tournament) return false
      if (!matchesDateFilter(item.dateKey, filters.date)) return false
      if (needle && !ledgerSearchText(item).includes(needle)) return false
      return true
    })
  }, [filters, ledger, query])

  const activeCount =
    [filters.type, filters.date, filters.team, filters.match, filters.tournament].filter((value) => value !== 'all')
      .length + (query ? 1 : 0)

  if (loading) return <FinanceLedgerSkeleton />

  if (!allowed) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="The complete financial ledger is not available on a player account."
        to="/finance"
        actionLabel="Back to My Payments"
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Starting balance {formatINR(0)}. Running balance updates automatically from recorded payments and expenses.
      </p>

      <FinanceFilters
        query={query}
        onQueryChange={setQuery}
        placeholder="Search transactions, teams, matches, or IDs"
        filters={filters}
        onChange={setFilters}
        onClear={() => {
          setQuery('')
          setFilters(EMPTY_FILTERS)
        }}
        activeCount={activeCount}
        showType={false}
        showDate
        extra={
          <>
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Transaction Type
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={filters.type}
                onChange={(event) => setFilters({ ...filters, type: event.target.value })}
              >
                <option value="all">All</option>
                {LEDGER_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            {user?.role !== ROLES.ORGANIZER ? (
              <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Related Team
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={filters.team}
                  onChange={(event) => setFilters({ ...filters, team: event.target.value })}
                >
                  <option value="all">All Teams</option>
                  {visibleTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Related Match
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={filters.match}
                onChange={(event) => setFilters({ ...filters, match: event.target.value })}
              >
                <option value="all">All Matches</option>
                {visibleMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.title || `${match.home} vs ${match.away}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Related Tournament
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={filters.tournament}
                onChange={(event) => setFilters({ ...filters, tournament: event.target.value })}
              >
                <option value="all">All Tournaments</option>
                {tournaments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        }
      />

      {filtered.length ? (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Related Entity</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Income</th>
                  <th className="px-4 py-3 text-right">Expense</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{item.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.code}</td>
                    <td className="max-w-[180px] px-4 py-3 text-slate-700">
                      <span className="line-clamp-2">{item.description}</span>
                    </td>
                    <td className="max-w-[160px] px-4 py-3 text-slate-600">
                      <span className="line-clamp-2">{item.relatedEntity}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      {item.income ? formatINR(item.income) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {item.expense ? formatINR(item.expense) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatINR(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-400">{item.date}</p>
                <p className="mt-1 font-semibold text-slate-900">{item.description}</p>
                <p className="mt-1 text-xs break-words text-slate-500">
                  {item.code} · {item.relatedEntity}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.type}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className={item.income ? 'font-semibold text-emerald-700' : 'font-semibold text-slate-800'}>
                    {item.income ? `+ ${formatINR(item.income)}` : `- ${formatINR(item.expense)}`}
                  </span>
                  <span className="font-semibold text-slate-900">{formatINR(item.balance)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyDashboardState
          icon="finance"
          title={ledger.length ? 'No ledger entries found.' : 'No financial activity yet.'}
          description={
            ledger.length
              ? 'No ledger entries match the current filters.'
              : 'No financial activity was found.'
          }
        />
      )}
    </div>
  )
}
