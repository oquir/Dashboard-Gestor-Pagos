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

// Las pestañas de la barra lateral: lo seleccionado (tabla, celda, bloque) o lo de todo el documento.
export type PdfSidebarTab = 'selection' | 'document'

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
  // La N de la ultima version publicada o abierta de archivo; la proxima publicacion es N + 1.
  // Fuera del historial a proposito: deshacer no puede hacer que se repita una N.
  publishedVersion: number | null
  // Zoom del lienzo (1 = 100 %). Vista pura: no entra al historial, no se guarda y no toca el diseño.
  zoom: number
  setZoom: (zoom: number) => void
  // La herramienta de la barra flotante (mover, seleccion multiple, mano). Vista pura, como el zoom.
  tool: CanvasTool
  setTool: (tool: CanvasTool) => void
  // La pestaña de la barra lateral. Vista pura, como el zoom. Seleccionar algo pasa a 'selection';
  // abrir una clase en el editor, a 'document' (ahi vive el editor de clases).
  sidebarTab: PdfSidebarTab
  setSidebarTab: (tab: PdfSidebarTab) => void
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
  // Reemplaza el diseño por uno leido de un .html. Es un paso de deshacer: Ctrl+Z vuelve al de antes.
  // La version no vuelve (ver publishedVersion).
  loadDesign: (design: PdfDesign, version: number | null) => void
  markPublished: (version: number) => void
  removeBlock: (blockId: string) => void
  // En el borde de una hoja pasa a la vecina: al final de la anterior o al principio de la siguiente.
  moveBlock: (blockId: string, offset: -1 | 1) => void
  setHtmlBlock: (blockId: string, html: string) => void
  // extend: Shift+clic, agranda la seleccion dentro de la misma tabla.
  selectCell: (tableId: string, cellId: string, extend: boolean) => void
  selectBlock: (blockId: string) => void
  clearSelection: () => void
  setCellText: (cellId: string, text: string) => void
  setCellHtml: (cellId: string, html: string) => void
  setCellContentKind: (cellId: string, kind: PdfCellContentKind) => void
  // Pone o reemplaza el componente de la celda: cambiarlo de tipo o editar uno es la misma accion.
  setCellComponent: (cellId: string, component: PdfComponent) => void
  updateCellStyle: (cellId: string, patch: PdfCellStylePatch) => void
  // El mismo cambio en todas las celdas del rectangulo seleccionado (un paso de deshacer).
  updateSelectionStyle: (patch: PdfCellStylePatch) => void
  updateTableStyle: (tableId: string, patch: PdfTableStylePatch) => void
  // La clase abierta en el editor de clases. Vista pura, como el zoom: fuera del historial. Si deshacer
  // se la lleva, el editor simplemente no la encuentra y se cierra.
  editingClass: string | null
  setEditingClass: (name: string | null) => void
  // Las clases del diseño. addClass y createClassFromSelection devuelven el nombre de la nueva y la
  // abren en el editor (null si no se pudo).
  addClass: () => string | null
  updateClass: (name: string, patch: PdfClassPatch) => void
  // Tambien en cada celda que la lleva. Un nombre invalido o ya usado no hace nada.
  renameClass: (from: string, to: string) => void
  removeClass: (name: string) => void
  // Pone o quita la clase en todas las celdas seleccionadas (un paso de deshacer).
  setSelectionClass: (name: string, on: boolean) => void
  // Una clase nueva con el estilo propio de la celda del foco, puesta en las seleccionadas.
  createClassFromSelection: () => string | null
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
