import Icon from '../common/Icons'

export default function ReportActions({ onPrint, onExport }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      {onExport ? (
        <button
          type="button"
          onClick={onExport}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icon name="download" className="h-4 w-4" />
          Export CSV
        </button>
      ) : null}
      {onPrint ? (
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          <Icon name="printer" className="h-4 w-4" />
          Print Report
        </button>
      ) : null}
    </div>
  )
}
