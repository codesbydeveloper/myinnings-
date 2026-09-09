export function ReportCardSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

export function ReportChartSkeleton() {
  return <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
}

export function ReportTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
      <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
      <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
    </div>
  )
}

export default function ReportSkeletons() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportCardSkeleton />
        <ReportCardSkeleton />
        <ReportCardSkeleton />
        <ReportCardSkeleton />
      </div>
      <ReportChartSkeleton />
      <ReportTableSkeleton />
    </div>
  )
}
