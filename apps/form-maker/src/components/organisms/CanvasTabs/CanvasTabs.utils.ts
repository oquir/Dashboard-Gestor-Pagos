import { canTransfer } from '../../../lib'
import type { CanvasRow } from '../../../types'
import type { RowDragState } from '../../../types'
import type { TransferTabState } from '../../../types'

// Que estado muestran las pestanas que no son la activa. La fila manda sobre el campo porque los
// dos arrastres nunca coexisten: cada uno anula al otro al empezar.
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
