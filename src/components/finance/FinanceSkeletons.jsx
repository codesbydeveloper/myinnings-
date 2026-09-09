export function FinanceSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  )
}

export function FinanceListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  )
}

export function FinanceLedgerSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-12 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      ))}
    </div>
  )
}

export function FinancePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      <FinanceSummarySkeleton />
      <FinanceListSkeleton />
    </div>
  )
}
