import EmptyDashboardState from '../dashboard/EmptyDashboardState'
import { computeStandings } from '../../data/tournamentModel'

export default function TournamentStandings({ tournament, teams, matches }) {
  const rows = computeStandings(teams, matches, tournament)
  if (!rows.length) {
    return (
      <EmptyDashboardState
        icon="tournaments"
        title="No standings yet"
        description="Standings appear after league matches are completed."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Pos</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">Played</th>
            <th className="px-4 py-3">Won</th>
            <th className="px-4 py-3">Lost</th>
            <th className="px-4 py-3">Draw</th>
            <th className="px-4 py-3">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={row.teamId} className="text-slate-800">
              <td className="px-4 py-3 font-semibold">{index + 1}</td>
              <td className="px-4 py-3 font-medium">{row.teamName}</td>
              <td className="px-4 py-3">{row.played}</td>
              <td className="px-4 py-3">{row.won}</td>
              <td className="px-4 py-3">{row.lost}</td>
              <td className="px-4 py-3">{row.draw}</td>
              <td className="px-4 py-3 font-semibold text-emerald-700">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
