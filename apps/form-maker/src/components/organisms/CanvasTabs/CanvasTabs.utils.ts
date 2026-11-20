import { canTransfer } from '../../../lib'
import type { CanvasRow } from '../../../types'
import type { RowDragState } from '../../../types'
import type { TransferTabState } from '../../../types'

// La fila manda sobre el campo: los dos arrastres nunca coexisten.
export function resolveTransferState(
  rows: CanvasRow[],
  rowDrag: RowDragState | null,
  draggingFieldId: string | null,
): TransferTabState {
  if (rowDrag) {
    return canTransfer(rows, { kind: 'row', rowId: rowDrag.rowId }).allowed ? 'ready' : 'rejected'
  }

  if (draggingFieldId) {
    return canTransfer(rows, { kind: 'field', fieldId: draggingFieldId }).allowed
      ? 'ready'
      : 'rejected'
  }

  return 'idle'
}
