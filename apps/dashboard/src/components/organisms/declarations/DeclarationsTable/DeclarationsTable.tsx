import { useMemo } from 'react'
import Table from '../../Table'
import { APPROVAL_COLUMN, COLUMNS, INITIAL_ORDER } from './DeclarationsTable.constants'
import type { DeclarationsTableProps } from './DeclarationsTable.types'
import { col, selectionColumn } from './DeclarationsTable.utils'

/** Declaraciones filtradas, con casillas para elegirlas. La columna de aprobación va solo si alguna la tiene. */
export default function DeclarationsTable({
  rows,
  selection,
  mark,
  withApproval,
}: DeclarationsTableProps) {
  const columns = useMemo(
    () =>
      col.columns([
        selectionColumn(rows, selection, mark),
        ...COLUMNS,
        ...(withApproval ? [APPROVAL_COLUMN] : []),
      ]),
    [rows, selection, mark, withApproval],
  )

  return (
    <Table
      data={rows}
      columns={columns}
      perPage={15}
      initialOrder={INITIAL_ORDER}
      rowId={(f) => f.d.id}
      name="declaraciones"
      empty="No hay declaraciones con esos filtros"
    />
  )
}
