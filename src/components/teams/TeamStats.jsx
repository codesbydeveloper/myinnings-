import SectionCard from '../dashboard/SectionCard'
import { getWinRate } from '../../utils/helpers'

export default function TeamStats({ team }) {
  const stats = team.stats || { played: 0, wins: 0, losses: 0, draws: 0 }
  const winRate = getWinRate(stats)
  const lossRate = stats.played ? Math.round((stats.losses / stats.played) * 100) : 0
  const drawRate = stats.played ? Math.round((stats.draws / stats.played) * 100) : 0

  const cards = [
    { label: 'Total Matches', value: stats.played },
    { label: 'Wins', value: stats.wins, color: 'text-emerald-700' },
    { label: 'Losses', value: stats.losses, color: 'text-rose-700' },
    { label: 'Draws', value: stats.draws },
    { label: 'Win Percentage', value: `${winRate}%`, color: 'text-emerald-700' },
    { label: 'Total Players', value: team.players },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{card.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${card.color || 'text-slate-900'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <SectionCard title="Performance Breakdown">
        <Bar label="Wins" value={stats.wins} total={stats.played} percent={winRate} color="bg-emerald-500" />
        <Bar label="Losses" value={stats.losses} total={stats.played} percent={lossRate} color="bg-rose-400" />
        <Bar label="Draws" value={stats.draws} total={stats.played} percent={drawRate} color="bg-slate-400" />
      </SectionCard>
    </div>
  )
}

function Bar({ label, value, total, percent, color }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value} / {total} · {percent}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
