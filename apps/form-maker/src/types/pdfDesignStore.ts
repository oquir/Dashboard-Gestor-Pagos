import type { StoreApi } from 'zustand'
import type {
  PdfBlock,
  PdfCellContentKind,
  PdfCellStylePatch,
  PdfColumnPosition,
  PdfDesign,
  PdfFontFamily,
  PdfMargins,
  PdfRowPosition,
  PdfSelection,
  PdfTableStylePatch,
  PdfTaxType,
} from './pdfDesign'

export interface PdfDesignState {
  // null hasta que el diseñador abre la plantilla de un impuesto.
  design: PdfDesign | null
  // Estado de vista: no cuenta como cambio para el historial ni para el guardado.
  selection: PdfSelection | null
  // La hoja donde caen la tabla o el bloque nuevos: la de lo ultimo que se toco.
  activeSheetId: string | null
  lastSavedAt: string | null
  // El ultimo autoguardado que fallo (cupo lleno, sobre todo). Se limpia al guardar bien.
  saveError: string | null
  // Trae lo guardado de ese impuesto o empieza en blanco, y vacia el historial. Reabrir el mismo no
  // hace nada.
  openDesign: (taxType: PdfTaxType) => void
  setMargins: (updates: Partial<PdfMargins>) => void
  setFontFamily: (family: PdfFontFamily) => void
  setFontSize: (size: number) => void
  addSheet: () => void
  removeSheet: (sheetId: string) => void
  setActiveSheet: (sheetId: string) => void
  addBlock: (kind: PdfBlock['kind']) => void
  removeBlock: (blockId: string) => void
  moveBlock: (blockId: string, offset: -1 | 1) => void
  setHtmlBlock: (blockId: string, html: string) => void
  // extend: Shift+clic, agranda la seleccion dentro de la misma tabla.
  selectCell: (tableId: string, cellId: string, extend: boolean) => void
  selectBlock: (blockId: string) => void
  clearSelection: () => void
  setCellText: (cellId: string, text: string) => void
  setCellHtml: (cellId: string, html: string) => void
  setCellContentKind: (cellId: string, kind: PdfCellContentKind) => void
  updateCellStyle: (cellId: string, patch: PdfCellStylePatch) => void
  // El mismo cambio en todas las celdas del rectangulo seleccionado (un paso de deshacer).
  updateSelectionStyle: (patch: PdfCellStylePatch) => void
  updateTableStyle: (tableId: string, patch: PdfTableStylePatch) => void
  // Las operaciones de tabla actuan sobre la celda del foco de la seleccion.
  insertRow: (position: PdfRowPosition) => void
  removeRow: () => void
  insertColumn: (position: PdfColumnPosition) => void
  removeColumn: () => void
  mergeSelection: () => void
  splitCell: () => void
  setColumnWidth: (width: number | undefined) => void
  setRowHeight: (height: number | undefined) => void
  // Una tabla suelta se borra; una anidada devuelve su celda a texto.
  removeTable: (tableId: string) => void
  undo: () => void
  redo: () => void
  markSaved: (savedAt: string) => void
  setSaveError: (error: string) => void
}

// Lo que guarda cada paso del historial del PDF: el diseño y la seleccion de ese momento, para que
// deshacer vuelva a mostrar el cambio donde ocurrio. Solo el diseño decide si hubo un paso.
export type PdfHistorySnapshot = Pick<PdfDesignState, 'design' | 'selection'>

export type PdfHistoryPastState = Parameters<StoreApi<PdfDesignState>['setState']>[0]
