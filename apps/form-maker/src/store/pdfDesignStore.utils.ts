import { findBlock, findCell } from '../lib/pdfDesignEdit'
import type { PdfDesignState, PdfSelection } from '../types'

// La celda sobre la que actuan las operaciones de tabla: el foco de una seleccion de celdas.
export function focusOf(
  selection: PdfSelection | null,
): { tableId: string; cellId: string; anchorId: string } | null {
  if (selection?.kind !== 'cells') return null
  return {
    tableId: selection.tableId,
    cellId: selection.focusCellId,
    anchorId: selection.anchorCellId,
  }
}

// Repara la vista despues de un cambio que pudo borrar lo seleccionado (quitar una fila, una hoja,
// deshacer): una seleccion que apunta a algo que ya no existe se suelta, y la hoja activa vuelve a
// la primera si la suya se fue. Devuelve el mismo estado si no hay nada que reparar.
export function reconcilePdfView(state: PdfDesignState): PdfDesignState {
  const design = state.design
  if (!design) return state

  let selection: PdfSelection | null = state.selection
  if (selection?.kind === 'cells') {
    const anchor = findCell(design, selection.anchorCellId)
    const focus = findCell(design, selection.focusCellId)
    const sameTable: boolean =
      anchor !== null &&
      focus !== null &&
      anchor.table.id === selection.tableId &&
      focus.table.id === selection.tableId
    if (!sameTable) {
      selection =
        focus !== null
          ? {
              kind: 'cells',
              tableId: focus.table.id,
              anchorCellId: focus.cell.id,
              focusCellId: focus.cell.id,
            }
          : null
    }
  } else if (selection?.kind === 'block' && !findBlock(design, selection.blockId)) {
    selection = null
  }

  const activeSheetId: string | null = design.sheets.some(
    (sheet) => sheet.id === state.activeSheetId,
  )
    ? state.activeSheetId
    : design.sheets[0].id

  if (selection === state.selection && activeSheetId === state.activeSheetId) return state
  return { ...state, selection, activeSheetId }
}
