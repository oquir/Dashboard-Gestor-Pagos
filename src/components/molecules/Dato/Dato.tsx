import type { DatoProps } from './types'

/** Fila etiqueta–valor para fichas de detalle. */
export default function Dato({ etiqueta, children }: DatoProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  )
}
