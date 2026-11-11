import type { FigureProps } from './Figure.types'

/** Cifra destacada con su etiqueta, para resúmenes dentro de una tarjeta. */
export default function Figure({ label, children }: FigureProps) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-semibold text-slate-900">{children}</dd>
    </div>
  )
}
