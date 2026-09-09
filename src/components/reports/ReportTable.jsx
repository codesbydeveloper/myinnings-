import ReportEmptyState from './ReportEmptyState'

export default function ReportTable({
  columns = [],
  rows = [],
  emptyTitle,
  emptyDescription,
  onRowClick,
}) {
  if (!rows.length) {
    return <ReportEmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-500 uppercase">
              {columns.map((column) => (
                <th key={column.id} className="px-3 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-slate-50 last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.id} className="px-3 py-3 align-top text-slate-700">
                    {column.render ? column.render(row) : row[column.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`rounded-xl border border-slate-100 bg-slate-50 p-4 ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((column) => (
              <div key={column.id} className="flex justify-between gap-3 py-1 text-sm">
                <span className="text-slate-500">{column.label}</span>
                <span className="text-right font-medium text-slate-800">
                  {column.render ? column.render(row) : row[column.id]}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}
