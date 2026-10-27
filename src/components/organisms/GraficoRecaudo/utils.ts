import { etiquetaImpuesto, formatoPesos } from '../../../lib/formato'
import { ayudanteColumnas } from '../../../lib/tabla'
import type { FilaRecaudo } from '../../../types'
import { totalRecaudo } from '../../../utils'
import { VALOR } from './constants'
import type { Serie } from './types'

const col = ayudanteColumnas<FilaRecaudo>()

export const columnasTabla = (series: Serie[]) =>
  col.columns([
    col.accessor('etiqueta', { header: 'Periodo', enableSorting: false, meta: { clase: 'text-slate-700' } }),
    ...series.map(({ impuesto }) =>
      col.accessor((f) => f.valores[impuesto], { id: impuesto, header: etiquetaImpuesto[impuesto], meta: VALOR, cell: ({ getValue }) => formatoPesos(getValue()) }),
    ),
    col.accessor(totalRecaudo, {
      id: 'total',
      header: 'Total',
      meta: { ...VALOR, clase: `${VALOR.clase} font-medium` },
      cell: ({ getValue }) => formatoPesos(getValue()),
    }),
  ])

export function maximoRedondo(valor: number) {
  if (valor <= 0) return 1
  const magnitud = 10 ** Math.floor(Math.log10(valor))
  return Math.ceil(valor / magnitud) * magnitud
}
