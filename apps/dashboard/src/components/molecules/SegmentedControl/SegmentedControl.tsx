import type { SegmentedControlProps } from './SegmentedControl.types'

/** Botones de opción única: las pestañas de una página o los controles de una gráfica. */
export default function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  change,
  compact = false,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 ${className}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => change(o.value)}
          className={`rounded-md text-sm font-medium tabular-nums transition ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${
            value === o.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {o.text}
          {o.count !== undefined && (
            <span className="ml-1.5 text-xs text-slate-400">{o.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
