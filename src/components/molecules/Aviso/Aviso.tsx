import { CLASES_TONO } from './constants'
import type { AvisoProps } from './types'

/** Recuadro de color para resultados, errores y avisos. El color siempre va con su texto. */
export default function Aviso({ tono, icono: Icono, rol, children }: AvisoProps) {
  return (
    <div role={rol} className={`flex gap-2 rounded-lg px-4 py-3 text-sm ${CLASES_TONO[tono]}`}>
      {Icono && <Icono className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
