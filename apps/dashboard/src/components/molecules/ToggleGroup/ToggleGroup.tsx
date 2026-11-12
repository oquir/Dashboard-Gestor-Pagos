import { Check } from 'reicon-react'
import Tooltip from '../Tooltip'
import type { ToggleGroupProps } from './ToggleGroup.types'

/**
 * Filtros de sí o no con el mismo aspecto que `SegmentedControl`, para ir en la misma fila. A diferencia de este, cada
 * botón se prende y se apaga por su cuenta.
 */
export default function ToggleGroup({ label, options, className = '' }: ToggleGroupProps) {
  if (options.length === 0) return null

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex flex-wrap gap-1 rounded-lg bg-surface-raised p-1 ${className}`}
    >
      {options.map((o) => (
        <Tooltip key={o.text} content={o.title}>
          <button
            type="button"
            aria-pressed={o.isActive}
            onClick={() => o.change(!o.isActive)}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              o.isActive
                ? 'bg-surface text-brand-fg shadow-sm'
                : 'text-fg-soft hover:text-fg-strong'
            }`}
          >
            {o.isActive && <Check className="size-3.5" aria-hidden />}
            {o.text}
          </button>
        </Tooltip>
      ))}
    </div>
  )
}
