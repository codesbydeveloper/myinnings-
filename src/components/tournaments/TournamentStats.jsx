import SectionCard from '../dashboard/SectionCard'
import ProgressBar from '../dashboard/ProgressBar'
import { computeStandings, tournamentMatches } from '../../data/tournamentModel'
import { approvedRegistrations } from '../../data/tournamentModel'

export default function TournamentStats({ tournament, teams, matches }) {
  const related = tournamentMatches(matches, tournament.id)
  const completed = related.filter((match) => match.status === 'Completed').length
  const upcoming = related.filter((match) => match.status === 'Upcoming' || match.status === 'Live').length
  const approved = approvedRegistrations(tournament).length
  const standings = computeStandings(teams, related, tournament)
  const best = standings[0]
  const progress = related.length ? Math.round((completed / related.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Teams" value={String(approved)} />
        <Stat label="Total Matches" value={String(related.length)} />
        <Stat label="Completed Matches" value={String(completed)} />
        <Stat label="Upcoming Matches" value={String(upcoming)} />
      </div>
      <SectionCard title="Tournament Progress">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">Completion</span>
          <span className="font-semibold text-slate-800">{progress}%</span>
        </div>
        <ProgressBar value={completed} total={related.length || 1} />
      </SectionCard>
      {best ? (
        <SectionCard title="Best Performing Team">
          <p className="text-lg font-semibold text-slate-900">{best.teamName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {best.won} wins · {best.points} points · Most wins in this tournament
          </p>
        </SectionCard>
      ) : null}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
