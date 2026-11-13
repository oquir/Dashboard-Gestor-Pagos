import type { FigureProps } from './Figure.types'

/** Cifra destacada con su etiqueta, para resúmenes dentro de una tarjeta. */
export default function Figure({ label, children, isPositive = false }: FigureProps) {
  return (
    <div>
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd
        className={`text-lg font-semibold ${isPositive ? 'text-secondary-fg' : 'text-fg-strong'}`}
      >
        {children}
      </dd>
    </div>
  )
}
