import { formatoPesos } from '../../../../lib/formato'
import { ayudanteColumnas } from '../../../../lib/tabla'
import type { Renglon } from '../../../../types'

const col = ayudanteColumnas<Renglon>()

// Sin ordenamiento: la liquidación se lee en el orden del formulario.
export const COLUMNAS_RENGLONES = col.columns([
  col.accessor('codigo', { header: 'Renglón', enableSorting: false, meta: { clase: 'w-20 tabular-nums text-slate-500' } }),
  col.accessor('concepto', { header: 'Concepto', enableSorting: false, meta: { clase: 'text-slate-700' } }),
  col.accessor('valor', {
    header: 'Valor',
    enableSorting: false,
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])
