export default function ProgressBar({ value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
