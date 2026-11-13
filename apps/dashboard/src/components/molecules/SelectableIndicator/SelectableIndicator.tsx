import type { SelectableIndicatorProps } from './SelectableIndicator.types'

/** Indicador que también filtra: al elegirlo, el listado muestra solo lo que cuenta. */
export default function SelectableIndicator({
  label,
  value,
  isActive,
  onClick,
}: SelectableIndicatorProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`rounded-xl border bg-surface p-4 text-left shadow-sm transition ${isActive ? 'border-brand-border ring-1 ring-brand-border' : 'border-border hover:border-border-strong'}`}
    >
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-fg-strong">{value}</p>
    </button>
  )
}
