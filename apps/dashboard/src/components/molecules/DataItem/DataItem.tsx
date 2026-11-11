import type { DataItemProps } from './DataItem.types'

/** Fila etiqueta–valor para fichas de detalle. */
export default function DataItem({ label, children }: DataItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  )
}
