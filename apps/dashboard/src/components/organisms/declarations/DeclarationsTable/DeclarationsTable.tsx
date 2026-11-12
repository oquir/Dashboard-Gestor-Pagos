import { useMemo, useState } from 'react'
import { compactFormat, formatPesos } from '../../../../lib'
import type { Declaration } from '../../../../types'
import { Tooltip } from '../../../molecules'
import Table from '../../Table'
import PdfPreviewModal from '../PdfPreviewModal'
import {
  APPROVAL_COLUMN,
  COLUMNS,
  INITIAL_ORDER,
  NUMBER_COLUMN,
  SUMMARY_NOTE,
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
          // El globo da los valores exactos y aclara qué queda fuera de la suma.
          <Tooltip
            placement="top-end"
            content={
              <>
                <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums">
                  <dt>Total a pagar</dt>
                  <dd className="text-right">{formatPesos(sums.total)}</dd>
                  <dt>Pagado</dt>
                  <dd className="text-right">{formatPesos(sums.paid)}</dd>
                  <dt>Por pagar</dt>
                  <dd className="text-right">{formatPesos(sums.pending)}</dd>
                </dl>
                <p className="mt-2 text-on-inverse-muted">{SUMMARY_NOTE}</p>
              </>
            }
          >
            <p
              tabIndex={0}
              className="flex cursor-help flex-wrap items-center gap-x-3 gap-y-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border"
            >
              <span>
                Total a pagar{' '}
                <b className="font-medium tabular-nums text-fg-strong">
                  ${compactFormat(sums.total)}
                </b>
              </span>
              <span>
                Pagado{' '}
                <b className="font-medium tabular-nums text-secondary-fg">
                  ${compactFormat(sums.paid)}
                </b>
              </span>
              <span>
                Por pagar{' '}
                <b
                  className={`font-medium tabular-nums ${sums.pending > 0 ? 'text-danger-fg' : 'text-fg-strong'}`}
                >
                  ${compactFormat(sums.pending)}
                </b>
              </span>
            </p>
          </Tooltip>
        }
      />
      {preview && <PdfPreviewModal d={preview} close={() => setPreview(undefined)} />}
    </>
  )
}
