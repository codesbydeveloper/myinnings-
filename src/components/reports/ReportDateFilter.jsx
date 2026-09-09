import { REPORT_RANGES } from '../../utils/reportUtils'
import { fieldClass } from '../../utils/helpers'
import { useReportRange } from '../../context/ReportContext'

export default function ReportDateFilter() {
  const { range, setRange, rangeLabel } = useReportRange()

  return (
    <div className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Date range</p>
          <p className="mt-1 text-sm text-slate-600">{rangeLabel}</p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {REPORT_RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange({ preset: item.id })}
              className={`min-h-10 shrink-0 rounded-full px-3 text-sm font-semibold whitespace-nowrap ${
                range.preset === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {range.preset === 'custom' ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">Start date</span>
            <input
              type="date"
              value={range.start}
              onChange={(event) => setRange({ start: event.target.value })}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-500">End date</span>
            <input
              type="date"
              value={range.end}
              onChange={(event) => setRange({ end: event.target.value })}
              className={fieldClass}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
