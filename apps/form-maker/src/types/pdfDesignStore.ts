import type { StoreApi } from 'zustand'
import type {
  PdfBlock,
  PdfCellContentKind,
  PdfCellStylePatch,
  PdfClassPatch,
  PdfColumnPosition,
  PdfComponent,
  PdfDesign,
  PdfFontFamily,
  PdfMargins,
  PdfRowPosition,
  PdfSelection,
  PdfTableStylePatch,
  PdfTaxType,
} from './pdfDesign'
import type { CanvasTool } from './ui'

export type PdfSidebarTab = 'selection' | 'document'

// selection, zoom, tool, sidebarTab y editingClass son vista: no entran al historial ni se guardan.
export interface PdfDesignState {
  // null hasta abrir la plantilla de un impuesto.
  design: PdfDesign | null
  selection: PdfSelection | null
  // Donde cae la tabla o el bloque nuevo: la hoja de lo ultimo tocado.
  activeSheetId: string | null
  lastSavedAt: string | null
  // Se limpia al guardar bien.
  saveError: string | null
  // La proxima publicacion es N + 1. Fuera del historial: deshacer no puede repetir una N.
  publishedVersion: number | null
  zoom: number
  setZoom: (zoom: number) => void
  tool: CanvasTool
  setTool: (tool: CanvasTool) => void
  // Seleccionar pasa a 'selection'; abrir una clase, a 'document'.
  sidebarTab: PdfSidebarTab
  setSidebarTab: (tab: PdfSidebarTab) => void
  // Vacia el historial. Reabrir el mismo no hace nada.
  openDesign: (taxType: PdfTaxType) => void
  setMargins: (updates: Partial<PdfMargins>) => void
  setFontFamily: (family: PdfFontFamily) => void
  setFontSize: (size: number) => void
  addSheet: () => void
  removeSheet: (sheetId: string) => void
  setActiveSheet: (sheetId: string) => void
  addBlock: (kind: PdfBlock['kind']) => void
  // Un paso de deshacer; la version no vuelve con Ctrl+Z.
  loadDesign: (design: PdfDesign, version: number | null) => void
  markPublished: (version: number) => void
  removeBlock: (blockId: string) => void
  // En el borde de una hoja pasa a la vecina.
  moveBlock: (blockId: string, offset: -1 | 1) => void
  setHtmlBlock: (blockId: string, html: string) => void
  // extend: Shift+clic, dentro de la misma tabla.
  selectCell: (tableId: string, cellId: string, extend: boolean) => void
  selectBlock: (blockId: string) => void
  clearSelection: () => void
  setCellText: (cellId: string, text: string) => void
  setCellHtml: (cellId: string, html: string) => void
  setCellContentKind: (cellId: string, kind: PdfCellContentKind) => void
  setCellComponent: (cellId: string, component: PdfComponent) => void
  updateCellStyle: (cellId: string, patch: PdfCellStylePatch) => void
  // Un solo paso de deshacer para todo el rectangulo.
  updateSelectionStyle: (patch: PdfCellStylePatch) => void
  updateTableStyle: (tableId: string, patch: PdfTableStylePatch) => void
  // Si deshacer se lleva la clase, el editor no la encuentra y se cierra.
  editingClass: string | null
  setEditingClass: (name: string | null) => void
  // addClass y createClassFromSelection devuelven el nombre y la abren en el editor (null si no).
  addClass: () => string | null
  updateClass: (name: string, patch: PdfClassPatch) => void
  // Tambien en las celdas que la llevan. Nombre invalido o usado: no hace nada.
  renameClass: (from: string, to: string) => void
  removeClass: (name: string) => void
  setSelectionClass: (name: string, on: boolean) => void
  // Con el estilo propio de la celda del foco.
  createClassFromSelection: () => string | null
  // Las operaciones de tabla actuan sobre la celda del foco.
  insertRow: (position: PdfRowPosition) => void
  removeRow: () => void
  insertColumn: (position: PdfColumnPosition) => void
  removeColumn: () => void
  mergeSelection: () => void
  splitCell: () => void
  setColumnWidth: (width: number | undefined) => void
  setRowHeight: (height: number | undefined) => void
  // Suelta se borra; anidada devuelve su celda a texto.
  removeTable: (tableId: string) => void
  undo: () => void
  redo: () => void
  markSaved: (savedAt: string) => void
  setSaveError: (error: string) => void
}

// La seleccion viaja para que deshacer muestre el cambio donde ocurrio; solo el diseno decide si hubo
// paso.
export type PdfHistorySnapshot = Pick<PdfDesignState, 'design' | 'selection'>

export type PdfHistoryPastState = Parameters<StoreApi<PdfDesignState>['setState']>[0]
