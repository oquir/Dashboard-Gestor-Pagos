import type { DataItemProps } from './DataItem.types'

/** Fila etiqueta–valor para fichas de detalle. */
export default function DataItem({ label, children }: DataItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</dt>
      <dd className="mt-1 text-sm text-fg-strong">{children}</dd>
    </div>
  )
}
