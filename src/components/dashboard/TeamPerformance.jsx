import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import SectionCard from './SectionCard'

export default function TeamPerformance({ teams = [], viewTo = '/reports/teams' }) {
  if (!teams.length) return null

  return (
    <SectionCard
      title="Team Performance"
      action={
        <Link to={viewTo} className="text-sm font-medium text-emerald-700">
          View Full Reports
        </Link>
      }
    >
      <ul className="space-y-5">
        {teams.map((team) => (
          <li key={team.name}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-slate-900">{team.name}</p>
              <p className="text-sm font-semibold text-emerald-700">{team.winRate}% win rate</p>
            </div>
            <ProgressBar value={team.winRate} total={100} />
            <p className="mt-2 text-xs text-slate-500">
              Matches Played: {team.played} · Wins: {team.wins} · Losses: {team.losses} ·
              Draws: {team.draws}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
