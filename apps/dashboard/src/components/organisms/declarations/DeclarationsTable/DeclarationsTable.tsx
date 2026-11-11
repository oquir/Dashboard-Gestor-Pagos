import { useMemo, useState } from 'react'
import type { Declaration } from '../../../../types'
import Table from '../../Table'
import PdfPreviewModal from '../PdfPreviewModal'
import {
  APPROVAL_COLUMN,
  COLUMNS,
  INITIAL_ORDER,
  NUMBER_COLUMN,
  invoiceColumn,
} from './DeclarationsTable.constants'
import type { DeclarationsTableProps } from './DeclarationsTable.types'
import { col, selectionColumn } from './DeclarationsTable.utils'

/**
 * Declaraciones filtradas, con casillas para elegirlas. La columna de aprobación va solo si alguna la tiene. El número
 * de factura abre la vista previa del PDF de la declaración.
 */
export default function DeclarationsTable({
  rows,
  selection,
  mark,
  withApproval,
}: DeclarationsTableProps) {
  const [preview, setPreview] = useState<Declaration>()
  const columns = useMemo(
    () =>
      col.columns([
        selectionColumn(rows, selection, mark),
        NUMBER_COLUMN,
        invoiceColumn(setPreview),
        ...COLUMNS,
        ...(withApproval ? [APPROVAL_COLUMN] : []),
      ]),
    [rows, selection, mark, withApproval],
  )

  return (
    <>
      <Table
        data={rows}
        columns={columns}
        perPage={15}
        initialOrder={INITIAL_ORDER}
        rowId={(f) => f.d.id}
        name="declaraciones"
        empty="No hay declaraciones con esos filtros"
      />
      {preview && <PdfPreviewModal d={preview} close={() => setPreview(undefined)} />}
    </>
  )
}
