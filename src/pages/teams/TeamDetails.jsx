import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../../components/common/ConfirmModal'
import Icon from '../../components/common/Icons'
import StatusBadge from '../../components/dashboard/StatusBadge'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import ActionMenu from '../../components/teams/ActionMenu'
import AddPlayerModal from '../../components/teams/AddPlayerModal'
import TeamLogo from '../../components/teams/TeamLogo'
import TeamMatches from '../../components/teams/TeamMatches'
import TeamOverview from '../../components/teams/TeamOverview'
import TeamRoster from '../../components/teams/TeamRoster'
import TeamStats from '../../components/teams/TeamStats'
import { TeamDetailsSkeleton } from '../../components/teams/TeamSkeletons'
import { useAuth } from '../../context/AuthContext'
import { useTeams } from '../../context/TeamContext'
import { useMatches } from '../../context/MatchContext'
import { useToast } from '../../context/ToastContext'
import { getMatchesForTeam } from '../../data/matches'
import { ROLES } from '../../utils/constants'
import { simulateRequest } from '../../utils/helpers'
import {
  canArchiveTeam,
  canChangeTeamStatus,
  canEditTeam,
  canManageRoster,
  canViewAvailabilityBoard,
  canViewPayments,
  getVisibleTeams,
} from '../../utils/teamAccess'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'players', label: 'Players' },
  { id: 'matches', label: 'Matches' },
  { id: 'statistics', label: 'Statistics' },
]

export default function TeamDetails() {
  const { teamId } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    teams,
    players,
    getTeam,
    getTeamPlayers,
    getEligiblePlayers,
    addPlayersToTeam,
    removePlayerFromTeam,
    updatePlayerOnTeam,
    setTeamStatus,
  } = useTeams()
  const { matches: allMatches } = useMatches()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(null)

  const tab = TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'overview'

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 380)
    return () => window.clearTimeout(timer)
  }, [teamId])

  const team = getTeam(teamId)
  const visible = useMemo(
    () => getVisibleTeams(teams, players, user).some((item) => item.id === teamId),
    [players, teamId, teams, user],
  )
  const roster = getTeamPlayers(teamId)
  const matches = team ? getMatchesForTeam(team.name, allMatches) : []
  const upcoming = matches.filter(
    (match) => match.status === 'Upcoming' || match.status === 'Live',
  )

  const canEdit = canEditTeam(team, user)
  const canManage = canManageRoster(team, user)
  const showPayments = canViewPayments(user)
  const showAvailability =
    canViewAvailabilityBoard(user) || user?.role === ROLES.PLAYER

  const moreItems = []
  if (canChangeTeamStatus(team, user) && team?.status !== 'Active') {
    moreItems.push({
      label: 'Set Active',
      onClick: () => {
        setTeamStatus(team.id, 'Active')
        showToast(`${team.name} is now active.`)
      },
    })
  }
  if (canChangeTeamStatus(team, user) && team?.status === 'Active') {
    moreItems.push({
      label: 'Set Inactive',
      onClick: () => {
        setTeamStatus(team.id, 'Inactive')
        showToast(`${team.name} is now inactive.`)
      },
    })
  }
  if (canArchiveTeam(user) && team?.status !== 'Archived') {
    moreItems.push({
      label: 'Archive Team',
      icon: 'archive',
      tone: 'danger',
      onClick: () => {
        setTeamStatus(team.id, 'Archived')
        showToast(`${team.name} has been archived.`)
      },
    })
  }

  function setTab(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  async function handleAdd(ids) {
    setAdding(true)
    await simulateRequest(400)
    addPlayersToTeam(team.id, ids)
    setAdding(false)
    setAddOpen(false)
    showToast(
      ids.length === 1 ? 'Player added to the squad.' : `${ids.length} players added to the squad.`,
    )
  }

  async function confirmRemove() {
    const player = removing
    setRemoving(null)
    removePlayerFromTeam(team.id, player.id)
    showToast(`${player.name} was removed from ${team.name}.`)
  }

  function handleRoleChange(player, teamRole) {
    updatePlayerOnTeam(team.id, player.id, { teamRole })
    if (teamRole === 'Captain') {
      showToast(`${player.name} is now the captain.`)
    } else {
      showToast(`${player.name}'s role was updated.`)
    }
  }

  function handlePositionChange(player, position) {
    updatePlayerOnTeam(team.id, player.id, { position, role: position })
    showToast(`${player.name} is now listed as ${position}.`)
  }

  if (loading) return <TeamDetailsSkeleton />

  if (!team || !visible) {
    return (
      <EmptyDashboardState
        icon="teams"
        title="Team not found"
        description="This team is unavailable or you do not have access."
        actionLabel="Back to Teams"
        to="/teams"
      />
    )
  }

  return (
    <div className="space-y-6">
      <Link to="/teams" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        Back to Teams
      </Link>

      <section
        className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${
          team.status === 'Archived' ? 'border-amber-200' : 'border-slate-200'
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <TeamLogo team={team} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {team.name}
                </h1>
                <StatusBadge status={team.status} />
              </div>
              <p className="mt-1 truncate text-sm text-slate-500">
                {team.location || team.city} · {team.type} · Captain: {team.captain || 'Unassigned'}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {team.players} players · {team.available} available
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => navigate(`/teams/${team.id}/edit`)}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Team
              </button>
            ) : null}
            {canManage ? (
              <button
                type="button"
                onClick={() => {
                  setTab('players')
                  setAddOpen(true)
                }}
                className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Manage Players
              </button>
            ) : null}
            {moreItems.length ? <ActionMenu items={moreItems} /> : null}
          </div>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-11 px-4 text-sm font-semibold whitespace-nowrap transition ${
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

      {tab === 'overview' ? (
        <TeamOverview
          team={team}
          roster={roster}
          upcomingMatches={upcoming}
          user={user}
          showAvailability={showAvailability}
        />
      ) : null}

      {tab === 'players' ? (
        <div className="space-y-4">
          {canManage ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Add Player
              </button>
            </div>
          ) : null}
          <TeamRoster
            players={roster}
            canManage={canManage}
            showPayments={showPayments}
            onAdd={() => setAddOpen(true)}
            onRoleChange={handleRoleChange}
            onPositionChange={handlePositionChange}
            onRemove={setRemoving}
          />
        </div>
      ) : null}

      {tab === 'matches' ? <TeamMatches team={team} matches={matches} /> : null}
      {tab === 'statistics' ? <TeamStats team={team} /> : null}

      {addOpen ? (
        <AddPlayerModal
          teamName={team.name}
          players={getEligiblePlayers(team.id)}
          onClose={() => setAddOpen(false)}
          onAdd={handleAdd}
          saving={adding}
        />
      ) : null}

      <ConfirmModal
        open={Boolean(removing)}
        title={`Remove ${removing?.name || 'player'} from ${team.name}?`}
        description="This removes the player from the squad only. Their profile remains in the player directory."
        confirmLabel="Remove Player"
        icon="alert"
        variant="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </div>
  )
}
