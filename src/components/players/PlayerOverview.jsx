import { Link } from 'react-router-dom'
import SectionCard from '../dashboard/SectionCard'
import { useTournaments } from '../../context/TournamentContext'
import { approvedRegistrations } from '../../data/tournamentModel'

export default function PlayerOverview({ player, showContact }) {
  const { tournaments } = useTournaments()
  const participating = tournaments.filter((item) =>
    approvedRegistrations(item).some((entry) => entry.teamId === player.teamId),
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Personal Information">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Name" value={player.name} />
          <Info label="Location" value={player.location} />
          {showContact ? <Info label="Email" value={player.email} /> : null}
          {showContact ? <Info label="Phone" value={player.phone} /> : null}
        </dl>
      </SectionCard>

      <SectionCard title="Cricket Profile">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Playing Role" value={player.position} />
          <Info label="Batting Style" value={player.battingStyle} />
          <Info label="Bowling Style" value={player.bowlingStyle} />
        </dl>
      </SectionCard>

      <SectionCard title="Current Team" className="lg:col-span-2">
        {player.teamName ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Info label="Team" value={player.teamName} />
            <Info label="Date Joined" value={player.joinedDate} />
            <Info label="Team Role" value={player.teamRole} />
          </dl>
        ) : (
          <p className="text-sm text-slate-500">This player is not currently assigned to a team.</p>
        )}
      </SectionCard>

      <SectionCard title="Tournaments" className="lg:col-span-2">
        {participating.length ? (
          <ul className="space-y-2">
            {participating.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/tournaments/${item.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No tournament fixtures for this player team yet.</p>
        )}
      </SectionCard>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-800">{value || '—'}</dd>
    </div>
  )
}
