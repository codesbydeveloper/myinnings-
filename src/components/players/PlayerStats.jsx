import SectionCard from '../dashboard/SectionCard'

export default function PlayerStats({ player }) {
  const stats = player.stats || {
    played: 0,
    won: 0,
    runs: 0,
    highest: 0,
    average: 0,
    wickets: 0,
    bestFigures: '-',
  }
  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0
  const showBowling = player.position !== 'Batsman' || stats.wickets > 0
  const showBatting = player.position !== 'Bowler' || stats.runs > 40

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Matches Played" value={stats.played} />
        <StatCard label="Matches Won" value={stats.won} />
        <StatCard label="Win Percentage" value={`${winRate}%`} tone="text-emerald-700" />
      </div>

      <SectionCard title="Season form">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Win rate</span>
          <span className="font-semibold text-emerald-700">{winRate}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${winRate}%` }} />
        </div>
      </SectionCard>

      {showBatting ? (
        <SectionCard title="Batting">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Runs" value={stats.runs} compact />
            <StatCard label="Highest Score" value={stats.highest} compact />
            <StatCard label="Average" value={stats.average} compact />
          </div>
        </SectionCard>
      ) : null}

      {showBowling ? (
        <SectionCard title="Bowling">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Wickets" value={stats.wickets} compact />
            <StatCard label="Best Figures" value={stats.bestFigures} compact />
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}

function StatCard({ label, value, tone = 'text-slate-900', compact = false }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <p className={`mt-2 font-semibold ${compact ? 'text-xl' : 'text-2xl'} ${tone}`}>{value}</p>
    </div>
  )
}
