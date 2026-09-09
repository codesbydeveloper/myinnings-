export default function BrandMark({
  compact = false,
  theme = 'dark',
  size = 'md',
}) {
  const markSize = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  const titleClass = theme === 'light' ? 'text-slate-900' : 'text-white'
  const subtitleClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400'

  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 ${markSize}`}
      >
        <svg
          viewBox="0 0 24 24"
          className={iconSize}
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M8 6.5c2.2 1.6 3.2 4.1 3.2 7.5S10.2 19.9 8 21.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 6.5c-2.2 1.6-3.2 4.1-3.2 7.5S13.8 19.9 16 21.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold tracking-wide ${titleClass}`}>
          MyInnings
        </p>
        {!compact && (
          <p className={`truncate text-xs ${subtitleClass}`}>Cricket Management</p>
        )}
      </div>
    </div>
  )
}
