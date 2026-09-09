import { fieldClass } from '../../utils/helpers'

export default function ReportFilters({ filters = [] }) {
  if (!filters.length) return null

  return (
    <div className="no-print grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {filters.map((filter) => (
        <label key={filter.id} className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-500">{filter.label}</span>
          <select
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className={fieldClass}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}
