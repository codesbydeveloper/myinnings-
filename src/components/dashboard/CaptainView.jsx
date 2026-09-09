import ProgressBar from './ProgressBar'
import SectionCard from './SectionCard'

export default function CaptainView({ data }) {
  if (!data.availability?.length) return null

  return (
    <SectionCard title="Team Availability">
      <ul className="space-y-4">
        {data.availability.map((team) => (
          <li key={team.name}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-slate-800">{team.name}</p>
              <p className="shrink-0 text-xs text-slate-500">
                {team.available} / {team.total} Players Available
              </p>
            </div>
            <ProgressBar value={team.available} total={team.total} />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
