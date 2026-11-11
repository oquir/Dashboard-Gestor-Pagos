import type { IndicadorSeleccionableProps } from './types'

/** Indicador que también filtra: al elegirlo, el listado muestra solo lo que cuenta. */
export default function IndicadorSeleccionable({ etiqueta, valor, activo, onClick }: IndicadorSeleccionableProps) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${activo ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}
    >
      <p className="text-sm text-slate-500">{etiqueta}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{valor}</p>
    </button>
  )
}
