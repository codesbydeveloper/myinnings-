export function GroundCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

export function GroundDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        <div className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  )
}

export function GroundScheduleSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  )
}
