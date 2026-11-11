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
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${isActive ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </button>
  )
}
