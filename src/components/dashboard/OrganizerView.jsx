import { Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import { useTournaments } from '../../context/TournamentContext'
import { approvedRegistrations, pendingRegistrations } from '../../data/tournamentModel'
import SectionCard from './SectionCard'

export default function OrganizerView() {
  const { tournaments, approveTeam } = useTournaments()
  const { showToast } = useToast()
  const active = tournaments.filter((item) => !['Completed', 'Cancelled', 'Draft'].includes(item.status))
  const pending = tournaments.flatMap((tournament) =>
    pendingRegistrations(tournament).map((item) => ({ ...item, tournamentId: tournament.id, tournamentName: tournament.name })),
  )

  return (
    <>
      <SectionCard
        title="Active Tournaments"
        action={
          <Link to="/tournaments" className="text-sm font-medium text-emerald-700">
            Manage
          </Link>
        }
      >
        {active.length ? (
          <ul className="space-y-3">
            {active.map((tournament) => (
              <li key={tournament.id}>
                <Link to={`/tournaments/${tournament.id}`} className="block rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-medium text-slate-900">{tournament.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {approvedRegistrations(tournament).length} Teams · {tournament.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No active tournaments yet.</p>
        )}
      </SectionCard>

      <SectionCard title="Pending Team Registrations">
        <ul className="space-y-3">
          {pending.length === 0 && (
            <li className="text-sm text-slate-500">All registrations have been reviewed.</li>
          )}
          {pending.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.teamName}</p>
                <p className="text-xs text-slate-500">{item.tournamentName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const result = approveTeam(item.tournamentId, item.id)
                    showToast(result.ok ? `${item.teamName} has been approved.` : result.message)
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Approve
                </button>
                <Link
                  to={`/tournaments/${item.tournamentId}?tab=teams`}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  )
}
