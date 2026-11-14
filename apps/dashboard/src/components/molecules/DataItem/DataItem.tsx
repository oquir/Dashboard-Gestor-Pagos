import InfoTip from '../InfoTip'
import type { DataItemProps } from './DataItem.types'

/** Fila etiqueta–valor para fichas de detalle. */
export default function DataItem({ label, children, info }: DataItemProps) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {label}
        {info && <InfoTip label={label} content={info} />}
      </dt>
      <dd className="mt-1 text-sm text-fg-strong">{children}</dd>
    </div>
  )
}
