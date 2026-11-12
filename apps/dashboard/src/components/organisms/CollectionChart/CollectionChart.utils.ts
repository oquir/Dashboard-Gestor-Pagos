import { taxLabel, formatPesos, columnHelper } from '../../../lib'
import type { CollectionRow } from '../../../types'
import { totalCollection } from '../../../utils'
import { VALUE } from './CollectionChart.constants'
import type { Series } from './CollectionChart.types'

const col = columnHelper<CollectionRow>()

export const tableColumns = (series: Series[]) =>
  col.columns([
    col.accessor('label', {
      header: 'Periodo',
      enableSorting: false,
      meta: { classes: 'text-fg' },
    }),
    ...series.map(({ tax }) =>
      col.accessor((f) => f.values[tax], {
        id: tax,
        header: taxLabel[tax],
        meta: VALUE,
        cell: ({ getValue }) => formatPesos(getValue()),
      }),
    ),
    col.accessor(totalCollection, {
      id: 'total',
      header: 'Total',
      meta: { ...VALUE, classes: `${VALUE.classes} font-medium` },
      cell: ({ getValue }) => formatPesos(getValue()),
    }),
  ])

export function roundMaximum(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}
