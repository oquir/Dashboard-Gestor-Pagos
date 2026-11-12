import { AlertTriangle } from 'reicon-react'
import { sectorLabel, overCap, columnHelper } from '../../../../lib'
import type { Rate } from '../../../../types'

const col = columnHelper<Rate>()

export const COLUMNS = col.columns([
  col.accessor('ciiu', { header: 'CIIU', meta: { classes: 'tabular-nums text-fg-muted' } }),
  col.accessor('description', { header: 'Actividad', meta: { classes: 'text-fg-strong' } }),
  col.accessor((t) => sectorLabel[t.sector], {
    id: 'sector',
    header: 'Sector',
    meta: { classes: 'text-fg-soft' },
  }),
  col.accessor('perThousand', {
    header: 'Tarifa (por mil)',
    meta: { align: 'right', classes: 'whitespace-nowrap tabular-nums text-fg-strong' },
    cell: ({ row: { original: t } }) => (
      <>
        {t.perThousand.toLocaleString('es-CO')}
        {overCap(t) && (
          <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-warning-fg">
            <AlertTriangle className="size-3" aria-hidden /> Fuera de los topes de ley
          </p>
        )}
      </>
    ),
  }),
])
