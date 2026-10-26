import type { IconComponent } from 'reicon-react'
import type { ReactNode } from 'react'
import type { Tono } from '../../lib/tonos'

const CLASES_TONO: Record<Tono, string> = {
  neutral: 'bg-slate-50 text-slate-700',
  info: 'bg-brand-50 text-brand-800',
  exito: 'bg-emerald-50 text-emerald-800',
  alerta: 'bg-amber-50 text-amber-800',
  peligro: 'bg-red-50 text-red-800',
}

/** Recuadro de color para resultados, errores y avisos. El color siempre va con su texto. */
export default function Aviso({ tono, icono: Icono, rol, children }: {
  tono: Tono
  icono?: IconComponent
  /** `status` para resultados; `alert` para errores que hay que atender. */
  rol?: 'status' | 'alert'
  children: ReactNode
}) {
  return (
    <div role={rol} className={`flex gap-2 rounded-lg px-4 py-3 text-sm ${CLASES_TONO[tono]}`}>
      {Icono && <Icono className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
