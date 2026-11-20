import { type TemporalState, temporal, type ZundoOptions } from 'zundo'
import { create, type Mutate, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand'
import { HISTORY_BURST_MS, HISTORY_LIMIT } from '../constants'
import { createBurstGate } from '../lib/history'
import { pdfComponentHtml } from '../lib/pdfComponents'
import { clampPdfZoom, createBlankDesign, normalizeMargins } from '../lib/pdfDesign'
import { loadPdfDesign } from '../lib/pdfDesignBank'
import { factoryPdfDesign } from '../lib/pdfTemplates'
import * as edit from '../lib/pdfDesignEdit'
import * as table from '../lib/pdfTable'
import { renderVerticalTextPng } from '../lib/pdfVerticalText'
import type {
  BurstGate,
  PdfDesign,
  PdfDesignState,
  PdfHistoryPastState,
  PdfHistorySnapshot,
  PdfPlacedCell,
  PdfSelection,
  PdfTable,
  StoredPdfDesign,
} from '../types'
import { focusOf, reconcilePdfView } from './pdfDesignStore.utils'

// Store del diseno del PDF, aparte a proposito: su propio historial (deshacer en el PDF no toca el
// formulario) y su propia llave por impuesto (usePdfDesignAutosave). Solo lo importa el disenador
// (React.lazy). Las reglas viven en lib/pdfDesignEdit y lib/pdfTable; aca se elige sobre que actuan
// y como queda la seleccion.

const historyGate: BurstGate = createBurstGate(HISTORY_BURST_MS)

type SetState = Parameters<StateCreator<PdfDesignState>>[0]

// Sin cambios devuelve el mismo estado: zustand no avisa y el historial no registra un paso vacio.
function editDesign(set: SetState, fn: (design: PdfDesign) => PdfDesign): void {
  set((state) => {
    if (!state.design) return state
    const design: PdfDesign = fn(state.design)
    return design === state.design ? state : { design }
  })
}

// Sobre la tabla de la seleccion desde la celda del foco; select dice como queda la seleccion (por
// defecto, igual).
function editFocusedTable(
  set: SetState,
  fn: (target: PdfTable, cellId: string, anchorId: string) => PdfTable,
  select?: (design: PdfDesign, selection: PdfSelection) => PdfSelection | null,
): void {
  set((state) => {
    const focus = focusOf(state.selection)
    if (!state.design || !focus) return state

    const design: PdfDesign = edit.mapTable(state.design, focus.tableId, (target) =>
      fn(target, focus.cellId, focus.anchorId),
    )
    if (design === state.design) return state

    const selection: PdfSelection | null =
      select && state.selection ? select(design, state.selection) : state.selection
    return reconcilePdfView({ ...state, design, selection })
  })
}

const createPdfDesignState: StateCreator<PdfDesignState> = (set, get) => ({
  design: null,
  selection: null,
  activeSheetId: null,
  lastSavedAt: null,
  saveError: null,
  publishedVersion: null,
  zoom: 1,
  tool: 'move',
  sidebarTab: 'selection',
  editingClass: null,

  setTool: (tool) => set((state) => (state.tool === tool ? state : { tool })),

  setSidebarTab: (sidebarTab) =>
    set((state) => (state.sidebarTab === sidebarTab ? state : { sidebarTab })),

  setZoom: (zoom) =>
    set((state) => {
      const next: number = clampPdfZoom(zoom)
      return next === state.zoom ? state : { zoom: next }
    }),

  openDesign: (taxType) => {
    if (get().design?.taxType === taxType) return

    // Sin nada guardado arranca con la plantilla de fabrica del impuesto, si tiene (hoy el ICA).
    const stored: StoredPdfDesign | null = loadPdfDesign(taxType)
    const design: PdfDesign = stored
      ? stored.design
      : (factoryPdfDesign(taxType) ?? createBlankDesign(taxType))
    set({
      design,
      selection: null,
      editingClass: null,
      sidebarTab: 'selection',
      activeSheetId: design.sheets[0].id,
      lastSavedAt: stored ? stored.savedAt : null,
      saveError: null,
      publishedVersion: stored?.version ?? null,
    })
    clearPdfHistory()
  },

  // Un archivo de otro impuesto nunca llega aca: lib/pdfFile lo rechaza al leerlo.
  loadDesign: (design, version) =>
    set((state) => {
      if (!state.design || design.taxType !== state.design.taxType) return state
      return {
        design,
        selection: null,
        activeSheetId: design.sheets[0].id,
        publishedVersion: version ?? state.publishedVersion,
      }
    }),

  markPublished: (version) => set({ publishedVersion: version }),

  setMargins: (updates) =>
    editDesign(set, (design) => {
      const margins = normalizeMargins({ ...design.margins, ...updates })
      const same: boolean = JSON.stringify(margins) === JSON.stringify(design.margins)
      return same ? design : { ...design, margins }
    }),

  setFontFamily: (family) =>
    editDesign(set, (design) =>
      design.fontFamily === family ? design : { ...design, fontFamily: family },
    ),

  setFontSize: (size) =>
    editDesign(set, (design) =>
      !Number.isFinite(size) || size <= 0 || design.fontSize === size
        ? design
        : { ...design, fontSize: size },
    ),

  addSheet: () =>
    set((state) => {
      if (!state.design) return state
      const design: PdfDesign = edit.addSheet(state.design)
      return { design, activeSheetId: design.sheets[design.sheets.length - 1].id, selection: null }
    }),

  removeSheet: (sheetId) =>
    set((state) => {
      if (!state.design) return state
      const design: PdfDesign = edit.removeSheet(state.design, sheetId)
      return design === state.design ? state : reconcilePdfView({ ...state, design })
    }),

  setActiveSheet: (sheetId) => set({ activeSheetId: sheetId }),

  addBlock: (kind) =>
    set((state) => {
      if (!state.design) return state
      const sheetId: string = state.activeSheetId ?? state.design.sheets[0].id
      const design: PdfDesign = edit.addBlock(state.design, sheetId, kind)
      if (design === state.design) return state

      // Lo nuevo queda seleccionado.
      const blocks = design.sheets.find((sheet) => sheet.id === sheetId)?.blocks ?? []
      const added = blocks[blocks.length - 1]
      const selection: PdfSelection | null =
        added.kind === 'html'
          ? { kind: 'block', blockId: added.id }
          : {
              kind: 'cells',
              tableId: added.id,
              anchorCellId: added.rows[0].cells[0].id,
              focusCellId: added.rows[0].cells[0].id,
            }
      return { design, selection, activeSheetId: sheetId }
    }),

  removeBlock: (blockId) =>
    set((state) => {
      if (!state.design) return state
      const design: PdfDesign = edit.removeBlock(state.design, blockId)
      return design === state.design ? state : reconcilePdfView({ ...state, design })
    }),

  // La hoja activa sigue al bloque.
  moveBlock: (blockId, offset) =>
    set((state) => {
      if (!state.design) return state
      const design: PdfDesign = edit.moveBlock(state.design, blockId, offset)
      if (design === state.design) return state
      return { design, activeSheetId: edit.sheetOf(design, blockId) ?? state.activeSheetId }
    }),

  setHtmlBlock: (blockId, html) =>
    editDesign(set, (design) => edit.setHtmlBlock(design, blockId, html)),

  selectCell: (tableId, cellId, extend) =>
    set((state) => {
      const current: PdfSelection | null = state.selection
      const anchorCellId: string =
        extend && current?.kind === 'cells' && current.tableId === tableId
          ? current.anchorCellId
          : cellId
      const sheetId: string | null = state.design ? edit.sheetOf(state.design, tableId) : null
      return {
        selection: { kind: 'cells', tableId, anchorCellId, focusCellId: cellId },
        activeSheetId: sheetId ?? state.activeSheetId,
        sidebarTab: 'selection',
      }
    }),

  selectBlock: (blockId) =>
    set((state) => ({
      selection: { kind: 'block', blockId },
      sidebarTab: 'selection',
      activeSheetId: (state.design && edit.sheetOf(state.design, blockId)) ?? state.activeSheetId,
    })),

  clearSelection: () => set((state) => (state.selection === null ? state : { selection: null })),

  setCellText: (cellId, text) =>
    editDesign(set, (design) => edit.setCellText(design, cellId, text)),

  setCellHtml: (cellId, html) =>
    editDesign(set, (design) => edit.setCellHtml(design, cellId, html)),

  // Un componente que pasa a HTML deja el HTML que publicaria: la salida para lo que el componente
  // casi cubre.
  setCellContentKind: (cellId, kind) =>
    editDesign(set, (design) => {
      const content = edit.findCell(design, cellId)?.cell.content
      if (content?.kind === 'component' && kind === 'html') {
        const html: string = pdfComponentHtml(content.component, {
          mode: 'file',
          fontFamily: design.fontFamily,
          renderVerticalText: renderVerticalTextPng,
        })
        return edit.setCellHtml(design, cellId, html)
      }
      return edit.setCellContentKind(design, cellId, kind)
    }),

  setCellComponent: (cellId, component) =>
    editDesign(set, (design) => edit.setCellComponent(design, cellId, component)),

  updateCellStyle: (cellId, patch) =>
    editDesign(set, (design) => edit.updateCellStyle(design, cellId, patch)),

  updateSelectionStyle: (patch) =>
    editDesign(set, (design) => {
      const ids: string[] = edit.selectedCellIds(design, get().selection)
      return ids.reduce((current, cellId) => edit.updateCellStyle(current, cellId, patch), design)
    }),

  updateTableStyle: (tableId, patch) =>
    editDesign(set, (design) => edit.updateTableStyle(design, tableId, patch)),

  // Cerrar el editor (null) no cambia de pestana; abrir una clase lleva a Documento.
  setEditingClass: (name) =>
    set((state) => {
      if (state.editingClass === name) return state
      return name === null ? { editingClass: null } : { editingClass: name, sidebarTab: 'document' }
    }),

  addClass: () => {
    const design: PdfDesign | null = get().design
    if (!design) return null
    const name: string = edit.nextClassName(design)
    editDesign(set, (current) => edit.addClass(current, { name }))
    set({ editingClass: name, sidebarTab: 'document' })
    return name
  },

  updateClass: (name, patch) => editDesign(set, (design) => edit.updateClass(design, name, patch)),

  // El editor sigue abierto sobre la clase renombrada.
  renameClass: (from, to) => {
    const before: PdfDesign | null = get().design
    editDesign(set, (design) => edit.renameClass(design, from, to))
    if (get().design !== before && get().editingClass === from) set({ editingClass: to })
  },

  removeClass: (name) => editDesign(set, (design) => edit.removeClass(design, name)),

  setSelectionClass: (name, on) =>
    editDesign(set, (design) =>
      edit.setCellsClass(design, edit.selectedCellIds(design, get().selection), name, on),
    ),

  createClassFromSelection: () => {
    const { design, selection } = get()
    if (!design || selection?.kind !== 'cells') return null
    const name: string = edit.nextClassName(design)
    editDesign(set, (current) =>
      edit.createClassFromCell(
        current,
        edit.selectedCellIds(current, selection),
        selection.focusCellId,
        name,
      ),
    )
    if (get().design === design) return null
    set({ editingClass: name, sidebarTab: 'document' })
    return name
  },

  insertRow: (position) =>
    editFocusedTable(set, (target, cellId) => table.insertRow(target, cellId, position)),

  removeRow: () => editFocusedTable(set, (target, cellId) => table.removeRow(target, cellId)),

  insertColumn: (position) =>
    editFocusedTable(set, (target, cellId) => table.insertColumn(target, cellId, position)),

  removeColumn: () => editFocusedTable(set, (target, cellId) => table.removeColumn(target, cellId)),

  // Combinar deja la celda de arriba a la izquierda, y esa queda seleccionada.
  mergeSelection: () => {
    const state: PdfDesignState = get()
    const focus = focusOf(state.selection)
    if (!state.design || !focus) return

    const target = edit.findTable(state.design, focus.tableId)?.table
    const rect = target ? table.selectionRect(target, focus.anchorId, focus.cellId) : null
    const origin: PdfPlacedCell | undefined =
      target && rect
        ? table
            .placeCells(target)
            .placed.find((item) => item.row === rect.top && item.col === rect.left)
        : undefined
    if (!origin) return

    editFocusedTable(
      set,
      (current, cellId, anchorId) => table.mergeCells(current, anchorId, cellId),
      (_design, selection) =>
        selection.kind === 'cells'
          ? { ...selection, anchorCellId: origin.cell.id, focusCellId: origin.cell.id }
          : selection,
    )
  },

  splitCell: () => editFocusedTable(set, (target, cellId) => table.splitCell(target, cellId)),

  setColumnWidth: (width) =>
    editFocusedTable(set, (target, cellId) => {
      const placed: PdfPlacedCell | null = table.findPlaced(target, cellId)
      return placed ? table.setColumnWidth(target, placed.col, width) : target
    }),

  setRowHeight: (height) =>
    editFocusedTable(set, (target, cellId) => {
      const row = target.rows.find((item) => item.cells.some((cell) => cell.id === cellId))
      return row ? table.setRowHeight(target, row.id, height) : target
    }),

  removeTable: (tableId) =>
    set((state) => {
      if (!state.design) return state

      const owner: string | null = edit.findTableOwner(state.design, tableId)
      if (owner) {
        const design: PdfDesign = edit.setCellContentKind(state.design, owner, 'text')
        const ownerTable = edit.findCell(design, owner)?.table
        const selection: PdfSelection | null = ownerTable
          ? { kind: 'cells', tableId: ownerTable.id, anchorCellId: owner, focusCellId: owner }
          : null
        return { design, selection }
      }

      const design: PdfDesign = edit.removeBlock(state.design, tableId)
      return design === state.design ? state : reconcilePdfView({ ...state, design })
    }),

  undo: () => travelPdfHistory('undo'),
  redo: () => travelPdfHistory('redo'),

  markSaved: (savedAt) => set({ lastSavedAt: savedAt, saveError: null }),

  setSaveError: (error) => set({ saveError: error }),
})

const PDF_HISTORY_OPTIONS: ZundoOptions<PdfDesignState, PdfHistorySnapshot> = {
  partialize: (state) => ({ design: state.design, selection: state.selection }),
  // Por referencia: una edicion sin cambios devuelve el mismo diseno.
  equality: (a, b) => a.design === b.design,
  limit: HISTORY_LIMIT,
  handleSet: (handleSet) =>
    historyGate.wrap((pastState: PdfHistoryPastState): void => handleSet(pastState)),
}

export const usePdfDesignStore: UseBoundStore<
  Mutate<StoreApi<PdfDesignState>, [['temporal', StoreApi<TemporalState<PdfHistorySnapshot>>]]>
> = create<PdfDesignState>()(temporal(createPdfDesignState, PDF_HISTORY_OPTIONS))

// Deshacer y rehacer escriben con el set crudo de zundo y no se registran; despues se repara la
// vista (seleccion u hoja que ya no existen).
function travelPdfHistory(direction: 'undo' | 'redo'): void {
  historyGate.reset()

  const temporalState: TemporalState<PdfHistorySnapshot> = usePdfDesignStore.temporal.getState()
  if (direction === 'undo') temporalState.undo()
  else temporalState.redo()

  usePdfDesignStore.setState(reconcilePdfView)
}

function clearPdfHistory(): void {
  historyGate.reset()
  usePdfDesignStore.temporal.getState().clear()
}
