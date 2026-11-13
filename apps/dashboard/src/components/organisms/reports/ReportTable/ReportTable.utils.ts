import { formatDate, formatPesos, columnHelper } from '../../../../lib'
import type { TableColumn, DataRow } from '../../../../lib'

const col = columnHelper<DataRow>()

export const tableColumns = (columns: TableColumn[]) =>
  col.columns(
    columns.map((c, i) =>
      col.accessor((f) => f[i], {
        id: String(i),
        header: c.title,
        meta:
          c.format === 'pesos'
            ? { align: 'right', classes: 'whitespace-nowrap tabular-nums text-fg-strong' }
            : { classes: 'whitespace-nowrap text-fg' },
        cell: ({ getValue }) => {
          const value = getValue()
          if (c.format === 'pesos') return formatPesos(Number(value))
          return c.format === 'date' && value ? formatDate(String(value)) : value
        },
      }),
    ),
  )
