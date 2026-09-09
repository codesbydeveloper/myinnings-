export default function SectionHeader({ title, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}
