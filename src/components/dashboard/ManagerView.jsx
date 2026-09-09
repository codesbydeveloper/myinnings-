import SectionCard from './SectionCard'

export default function ManagerView({ data }) {
  if (!data.tasks?.length) return null

  return (
    <SectionCard title="Team Tasks">
      <ul className="space-y-2">
        {data.tasks.map((task) => (
          <li
            key={task}
            className="rounded-lg border border-slate-100 px-3 py-2.5 text-sm text-slate-700"
          >
            {task}
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
