import InfoTip from '../InfoTip'
import type { FigureProps } from './Figure.types'

/** Cifra destacada con su etiqueta, para resúmenes dentro de una tarjeta. */
export default function Figure({ label, children, isPositive = false, info }: FigureProps) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-fg-muted">
        {label}
        {info && <InfoTip label={label} content={info} />}
      </dt>
      <dd
        className={`text-lg font-semibold ${isPositive ? 'text-secondary-fg' : 'text-fg-strong'}`}
      >
        {children}
      </dd>
    </div>
  )
}
