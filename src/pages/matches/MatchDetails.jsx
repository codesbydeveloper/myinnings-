import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import AccessRestricted from '../../components/common/AccessRestricted'
import ConfirmModal from '../../components/common/ConfirmModal'
import Icon from '../../components/common/Icons'
import StatusBadge from '../../components/dashboard/StatusBadge'
import EmptyDashboardState from '../../components/dashboard/EmptyDashboardState'
import MatchAvailabilityPanel from '../../components/matches/MatchAvailabilityPanel'
import MatchCosts from '../../components/matches/MatchCosts'
import MatchOverview from '../../components/matches/MatchOverview'
import MatchResult from '../../components/matches/MatchResult'
import MatchSquad from '../../components/matches/MatchSquad'
import { MatchDetailsSkeleton } from '../../components/matches/MatchSkeletons'
import TeamLogo from '../../components/teams/TeamLogo'
import { useAuth } from '../../context/AuthContext'
import { useMatches } from '../../context/MatchContext'
import { useTeams } from '../../context/TeamContext'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { findOwnPlayer } from '../../utils/playerAccess'
import {
  canCancelMatch,
  canChangeMatchAvailability,
  canEditMatch,
  canManageCosts,
  canManageSquad,
  canRecordResult,
  canViewMatch,
} from '../../utils/matchAccess'
import { fieldClass, getTeamInitials } from '../../utils/helpers'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'squad', label: 'Squad' },
  { id: 'availability', label: 'Availability' },
  { id: 'costs', label: 'Costs' },
  { id: 'result', label: 'Result' },
]

export default function MatchDetails() {
  const { matchId } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { teams, players, getTeamPlayers } = useTeams()
  const {
    getMatch,
    setMatchAvailability,
    setSquadSize,
    toggleSquadPlayer,
    finalizeSquad,
    replaceSquadPlayer,
    addMatchCost,
    updateMatchCost,
    removeMatchCost,
    setMatchResult,
    setMatchStatus,
    cancelMatch,
  } = useMatches()
  const { advanceFromResult } = useTournaments()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const match = getMatch(matchId)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 360)
    return () => window.clearTimeout(timer)
  }, [matchId])

  const visible = match ? canViewMatch(match, user, teams, players) : false
  const roster = match?.homeTeamId ? getTeamPlayers(match.homeTeamId) : []
  const ownPlayer =
    roster.find((player) => player.name === user?.name) || findOwnPlayer(players, user)
  const tab = TABS.some((item) => item.id === params.get('tab')) ? params.get('tab') : 'overview'

  function setTab(next) {
    const nextParams = new URLSearchParams(params)
    if (next === 'overview') nextParams.delete('tab')
    else nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  if (loading) return <MatchDetailsSkeleton />

  if (!match) {
    return (
      <EmptyDashboardState
        icon="matches"
        title="Match not found"
        description="This match is unavailable or you do not have access."
        actionLabel="Back to Matches"
        to="/matches"
      />
    )
  }

  if (!visible) {
    return (
      <AccessRestricted
        title="Access restricted"
        description="You do not have permission to view this match."
        to="/matches"
        actionLabel="Back to Matches"
      />
    )
  }

  const awayTeam = teams.find((team) => team.id === match.awayTeamId) || {
    name: match.away,
    shortName: getTeamInitials(match.away),
    colors: { primary: '#0f172a' },
  }
  const homeTeam = teams.find((team) => team.id === match.homeTeamId)

  return (
    <div className="space-y-6">
      <Link to="/matches" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
        <Icon name="chevronLeft" className="h-4 w-4" />
        Back to Matches
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <StatusBadge status={match.status} />
          <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex justify-center">
                <TeamLogo team={homeTeam || { name: match.home, colors: { primary: '#059669' } }} size="lg" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold tracking-wide text-slate-900 uppercase sm:text-base">
                {match.home}
              </p>
            </div>
            <p className="shrink-0 text-xs font-bold tracking-[0.25em] text-emerald-700">VS</p>
            <div className="min-w-0 flex-1">
              <div className="flex justify-center">
                <TeamLogo team={awayTeam} size="lg" />
              </div>
              <p className="mt-2 truncate text-sm font-semibold tracking-wide text-slate-900 uppercase sm:text-base">
                {match.away}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            {match.date} · {match.time}
          </p>
          <p className="text-xs text-slate-400">
            {match.venue} · {match.format}
          </p>
        </div>
      </section>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {TABS.map((item) => (
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

      {tab === 'overview' ? (
        <MatchOverview
          match={match}
          canEdit={canEditMatch(match, user, teams)}
          canCancel={canCancelMatch(match, user, teams)}
          onCancel={() => setCancelOpen(true)}
          onStatus={(status) => {
            setMatchStatus(match.id, status)
            showToast(`Match marked as ${status}.`)
          }}
        />
      ) : null}

      {tab === 'squad' ? (
        <MatchSquad
          match={match}
          roster={roster}
          availability={match.availability || {}}
          canManage={canManageSquad(match, user, teams)}
          onToggle={(playerId) => toggleSquadPlayer(match.id, playerId)}
          onSize={(size) => setSquadSize(match.id, size)}
          onFinalize={() => setFinalizeOpen(true)}
          onReplace={(outId, inId) => {
            replaceSquadPlayer(match.id, outId, inId)
            showToast('Squad replacement recorded.')
          }}
        />
      ) : null}

      {tab === 'availability' ? (
        <MatchAvailabilityPanel
          roster={roster}
          availability={match.availability || {}}
          ownPlayer={ownPlayer && roster.some((player) => player.id === ownPlayer.id) ? ownPlayer : null}
          canEditOwn={ownPlayer ? canChangeMatchAvailability(match, ownPlayer, user) : false}
          onChange={(playerId, status) => {
            setMatchAvailability(match.id, playerId, status)
            showToast(`Availability updated to ${status}.`)
          }}
        />
      ) : null}

      {tab === 'costs' ? (
        <MatchCosts
          match={match}
          canManage={canManageCosts(match, user, teams)}
          onAdd={(cost) => addMatchCost(match.id, cost)}
          onUpdate={(costId, payload) => updateMatchCost(match.id, costId, payload)}
          onRemove={(costId) => removeMatchCost(match.id, costId)}
        />
      ) : null}

      {tab === 'result' ? (
        <MatchResult
          match={match}
          canRecord={canRecordResult(match, user, teams)}
          onSave={(result) => {
            setMatchResult(match.id, result)
            advanceFromResult(match.id, result)
            showToast('Match result saved.')
            navigate(`/matches/${match.id}?tab=result`)
          }}
        />
      ) : null}

      <ConfirmModal
        open={finalizeOpen}
        title="Are you sure you want to finalize this squad?"
        description="The selected players will be stored as the match squad. Replacements can still be recorded before the match."
        confirmLabel="Finalize Squad"
        icon="check"
        variant="dark"
        onCancel={() => setFinalizeOpen(false)}
        onConfirm={() => {
          finalizeSquad(match.id)
          setFinalizeOpen(false)
          showToast('Squad finalized.')
        }}
      />

      {cancelOpen
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
              <button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                onClick={() => setCancelOpen(false)}
              />
              <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900">Cancel this match?</h3>
                <textarea
                  className={`mt-3 ${fieldClass}`}
                  rows={3}
                  placeholder="Cancellation reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCancelOpen(false)}
                    className="min-h-11 rounded-xl border border-slate-200 text-sm font-semibold"
                  >
                    Keep Match
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!cancelReason.trim()) return
                      cancelMatch(match.id, cancelReason.trim())
                      setCancelOpen(false)
                      showToast('Match cancelled.')
                    }}
                    className="min-h-11 rounded-xl bg-red-600 text-sm font-semibold text-white"
                  >
                    Cancel Match
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
