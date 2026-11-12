import { useMemo, useState } from 'react'
import { compactFormat, formatPesos } from '../../../../lib'
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
import { amounts, col, selectionColumn } from './DeclarationsTable.utils'

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

  const sums = useMemo(() => amounts(rows), [rows])

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
        summary={
          <p
            className="flex flex-wrap items-center gap-x-3 gap-y-1"
            title="Sin las solicitudes de corrección sin aceptar ni las declaraciones que reemplazó una corrección."
          >
            <span title={formatPesos(sums.total)}>
              Total a pagar{' '}
              <b className="font-medium tabular-nums text-fg-strong">
                ${compactFormat(sums.total)}
              </b>
            </span>
            <span title={formatPesos(sums.paid)}>
              Pagado{' '}
              <b className="font-medium tabular-nums text-secondary-fg">
                ${compactFormat(sums.paid)}
              </b>
            </span>
            <span title={formatPesos(sums.pending)}>
              Por pagar{' '}
              <b
                className={`font-medium tabular-nums ${sums.pending > 0 ? 'text-danger-fg' : 'text-fg-strong'}`}
              >
                ${compactFormat(sums.pending)}
              </b>
            </span>
          </p>
        }
      />
      {preview && <PdfPreviewModal d={preview} close={() => setPreview(undefined)} />}
    </>
  )
}
