import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import ConfirmModal from '../../components/common/ConfirmModal'
import Icon from '../../components/common/Icons'
import UserAvatar from '../../components/common/UserAvatar'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import ActionMenu from '../../components/teams/ActionMenu'
import PlayerAvailability from '../../components/players/PlayerAvailability'
import PlayerMatches from '../../components/players/PlayerMatches'
import PlayerOverview from '../../components/players/PlayerOverview'
import PlayerPayments from '../../components/players/PlayerPayments'
import PlayerStats from '../../components/players/PlayerStats'
import PlayerTeams from '../../components/players/PlayerTeams'
import { PlayerProfileSkeleton } from '../../components/players/PlayerSkeletons'
import { useAuth } from '../../context/AuthContext'
import { usePlayers } from '../../context/PlayerContext'
import { useFinance } from '../../context/FinanceContext'
import { useMatches } from '../../context/MatchContext'
import { useToast } from '../../context/ToastContext'
import { getMatchesForTeam } from '../../data/matches'
import { ROLES } from '../../utils/constants'
import {
  canEditPlayer,
  canEditPlayerStatus,
  canViewPlayer,
  canViewPlayerContact,
  canViewPlayerPayments,
  canChangePlayerAvailability,
  statusOptionsFor,
} from '../../utils/playerAccess'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'teams', label: 'Teams' },
  { id: 'matches', label: 'Matches' },
  { id: 'availability', label: 'Availability' },
  { id: 'payments', label: 'Payments' },
  { id: 'statistics', label: 'Statistics' },
]

export default function PlayerDetails() {
  const { playerId } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { players, teams, getPlayer, setPlayerStatus } = usePlayers()
  const { paymentsForPlayer } = useFinance()
  const { matches: allMatches, setMatchAvailability } = useMatches()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [statusChange, setStatusChange] = useState(null)

  const player = getPlayer(playerId)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [playerId])

  const visible = player ? canViewPlayer(player, user, teams, players) : false
  const canEdit = player ? canEditPlayer(player, user, teams) : false
  const showContact = player ? canViewPlayerContact(player, user, teams) : false
  const showPayments = player ? canViewPlayerPayments(player, user, teams) : false
  const canEditAvailability = player ? canChangePlayerAvailability(player, user) : false
  const canStatus = player ? canEditPlayerStatus(player, user, teams) : false

  const tabs = TABS.filter((tab) => tab.id !== 'payments' || showPayments)
  const tab = tabs.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'overview'
  const matches = player?.teamName ? getMatchesForTeam(player.teamName, allMatches) : []
  const upcoming = matches.filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live',
  )

  const moreItems =
    player && canStatus
      ? statusOptionsFor(user)
          .filter((status) => status !== player.status)
          .map((status) => ({
            label: `Set ${status}`,
            tone: status === 'Suspended' ? 'danger' : undefined,
            onClick: () => setStatusChange(status),
          }))
      : []

  function setTab(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  if (loading) return <PlayerProfileSkeleton />

  if (!player) {
    return (
      <EmptyDashboardState
        icon="players"
        title="Player not found"
        description="This player is unavailable or you do not have access."
        actionLabel="Back to Players"
        to="/players"
      />
    )
  }

  if (!visible) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to view this player profile."
        to={user?.role === ROLES.PLAYER ? '/dashboard' : '/players'}
        actionLabel={user?.role === ROLES.PLAYER ? 'Go to Dashboard' : 'Back to Players'}
      />
    )
  }

  const backTo = user?.role === ROLES.PLAYER ? '/dashboard' : '/players'
  const backLabel = user?.role === ROLES.PLAYER ? 'Back to Dashboard' : 'Back to Players'

  return (
    <div className="space-y-6">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        {backLabel}
      </Link>

      <section
        className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
          player.status === 'Suspended' ? 'border-red-200' : 'border-slate-200'
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar name={player.name} src={player.avatar} className="h-16 w-16 text-lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {player.name}
                </h1>
                <StatusBadge status={player.status || 'Active'} />
                <StatusBadge status={player.availability} />
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">
                {player.position} · {player.teamName || 'Unassigned'}
              </p>
              {player.teamRole && player.teamRole !== 'Player' ? (
                <p className="mt-1 text-sm font-medium text-emerald-700">{player.teamRole}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => navigate(`/players/${player.id}/edit`)}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Player
              </button>
            ) : null}
            {moreItems.length ? <ActionMenu items={moreItems} /> : null}
          </div>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap ${
                tab === item.id
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' ? <PlayerOverview player={player} showContact={showContact} /> : null}
      {tab === 'teams' ? (
        <PlayerTeams player={player} teams={teams} user={user} players={players} />
      ) : null}
      {tab === 'matches' ? <PlayerMatches player={player} matches={matches} /> : null}
      {tab === 'availability' ? (
        <PlayerAvailability
          player={player}
          matches={upcoming}
          canEdit={canEditAvailability}
          onChange={(matchId, status) => {
            setMatchAvailability(matchId, player.id, status)
            showToast(`Availability updated to ${status}.`)
          }}
        />
      ) : null}
      {tab === 'payments' && showPayments ? (
        <PlayerPayments
          payments={paymentsForPlayer(player).map((item) => ({
            id: item.id,
            description: item.description,
            event: item.matchTitle || item.tournamentName || item.teamName || item.type,
            amount: item.amount,
            date: item.paidDate || item.dueDate || item.createdDate,
            status: item.status,
            href: `/finance/payments/${item.id}`,
          }))}
        />
      ) : null}
      {tab === 'statistics' ? <PlayerStats player={player} /> : null}

      <ConfirmModal
        open={Boolean(statusChange)}
        title={`Set ${player.name} as ${statusChange}?`}
        description="This updates the player status across Teams and Players immediately."
        confirmLabel={`Set ${statusChange || 'Status'}`}
        icon="alert"
        variant={statusChange === 'Suspended' ? 'danger' : 'dark'}
        onCancel={() => setStatusChange(null)}
        onConfirm={() => {
          setPlayerStatus(player.id, statusChange)
          showToast(`${player.name} is now ${statusChange}.`)
          setStatusChange(null)
        }}
      />
    </div>
  )
}
