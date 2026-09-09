export default function WizardSteps({ steps, current, onSelect }) {
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const active = index === current
        const done = index < current
        return (
          <li key={step}>
            <button
              type="button"
              disabled={!onSelect || index > current}
              onClick={() => onSelect?.(index)}
              className={`flex min-w-max items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active
                  ? 'bg-emerald-600 text-white'
                  : done
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              } disabled:cursor-default`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                {index + 1}
              </span>
              {step}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
