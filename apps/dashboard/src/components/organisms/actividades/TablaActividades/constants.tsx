import { AlertTriangle } from 'reicon-react'
import { etiquetaSector } from '../../../../lib/formato'
import { fueraDeTope } from '../../../../lib/reglas'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Tarifa } from '../../../../types'

const col = ayudanteColumnas<Tarifa>()

export const COLUMNAS = col.columns([
  col.accessor('ciiu', { header: 'CIIU', meta: { clase: 'tabular-nums text-slate-500' } }),
  col.accessor('descripcion', { header: 'Actividad', meta: { clase: 'text-slate-900' } }),
  col.accessor((t) => etiquetaSector[t.sector], { id: 'sector', header: 'Sector', meta: { clase: 'text-slate-600' } }),
  col.accessor('porMil', {
    header: 'Tarifa (por mil)',
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ row: { original: t } }) => (
      <>
        {t.porMil.toLocaleString('es-CO')}
        {fueraDeTope(t) && (
          <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-amber-800">
            <AlertTriangle className="size-3" aria-hidden /> Fuera de los topes de ley
          </p>
        )}
      </>
    ),
  }),
])
