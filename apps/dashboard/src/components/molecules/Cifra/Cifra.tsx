import type { CifraProps } from './types'

/** Cifra destacada con su etiqueta, para resúmenes dentro de una tarjeta. */
export default function Cifra({ etiqueta, children }: CifraProps) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{etiqueta}</dt>
      <dd className="text-lg font-semibold text-slate-900">{children}</dd>
    </div>
  )
}
