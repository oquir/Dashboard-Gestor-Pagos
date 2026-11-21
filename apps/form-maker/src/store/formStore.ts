import { v4 as uuidv4 } from 'uuid'
import { type TemporalState, temporal, type ZundoOptions } from 'zundo'
import { create, type Mutate, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand'
import { ZOOM_DEFAULT } from '../constants/canvasZoom'
import { GRID_BASE_COLUMNS, MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from '../constants/grid'
import { HISTORY_BURST_MS, HISTORY_LIMIT } from '../constants/history'
import { sameIdSet, toggleId, withoutIds } from '../lib/canvasSelection/canvasSelection'
import { clampZoom } from '../lib/canvasZoom/canvasZoom'
import { slugifyFieldName, uniqueFieldName } from '../lib/fieldName/fieldName'
import { allowsManualOptions, isOptionBasedField } from '../lib/fieldOptions/fieldOptions'
import { createFieldRule, moveRule } from '../lib/fieldRule/fieldRule'
import { parseSuggestionsText } from '../lib/fieldSuggestions/fieldSuggestions'
import { createEmptyTooltip } from '../lib/fieldTooltip/fieldTooltip'
import {
  canTransfer,
  collectCrossingRefs,
  planLanding,
  transferGroup,
} from '../lib/fieldTransfer/fieldTransfer'
import { createValidationOverride } from '../lib/fieldValidationOverride/fieldValidationOverride'
import { createBurstGate, sameDocument, toHistorySnapshot } from '../lib/history/history'
import {
  clampGroupBounds,
  createRepeatableGroup,
  detachGroup,
  groupNamesInUse,
  normalizeGroupRows,
  pruneEmptyGroups,
} from '../lib/repeatableGroup/repeatableGroup'
import {
  getFreeRuns,
  getMaxSpanAt,
  repackRow,
  resolvePlacement,
  sortByColumn,
} from '../lib/rowLayout/rowLayout'
import { reorderRows } from '../lib/rowOrder/rowOrder'
import type { CanvasField } from '../types/field'
import type { FormState } from '../types/formStoreTypes'
import type {
  CanvasRow,
  FormStep,
  IntroModalState,
  IntroModalStep,
  RepeatableGroup,
} from '../types/formStructure'
import type { BurstGate, HistoryPastState, HistorySnapshot } from '../types/history'
import type { CanvasTarget, FieldPlacement } from '../types/placement'
import type { StateSlice } from '../types/store'
import { createBanksSlice } from './banksSlice'
import {
  NO_GROUPS,
  NO_ROWS,
  NO_SELECTION,
  PERFORMANCE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from './formStore.constants'
import {
  allFieldNames,
  allRows,
  buildInitialFormSteps,
  buildInitialIntroSteps,
  createEmptyField,
  createEmptyRow,
  createOptions,
  crossingNotice,
  findAnyField,
  getInitialDarkMode,
  getInitialLowPerformance,
  mapFieldEverywhere,
  mapRowEverywhere,
  reconcileViewAfterHistory,
  removeFieldsEverywhere,
  rowsAcrossFrom,
  rowsOfTarget,
  stepFieldIds,
} from './formStore.utils'

// El unico store: sostiene los dos lienzos y casi toda mutacion va al que contenga el id
// (mapRowEverywhere, mapFieldEverywhere). Historial con zundo en useFormStore.temporal; que se
// guarda y como se agrupa, en lib/history.

export function findRowById(slice: StateSlice, rowId: string): CanvasRow | null {
  for (const step of slice.formSteps) {
    const row = step.rows.find((r) => r.id === rowId)
    if (row) return row
  }

  for (const step of slice.introModal.steps) {
    const row = step.rows.find((r) => r.id === rowId)
    if (row) return row
  }

  return null
}

// Agrupa rafagas en un paso. De modulo: lo comparten handleSet, que registra, y deshacer/rehacer,
// que lo reinician.
const historyGate: BurstGate = createBurstGate(HISTORY_BURST_MS)

const createFormState: StateCreator<FormState, [['temporal', unknown]], []> = (set) => ({
  ...createBanksSlice(set),
  formSteps: [
    {
      stepId: 'step-1',
      title: 'Paso 1',
      rows: [{ id: 'row-1', columns: GRID_BASE_COLUMNS, fields: [] }],
    },
  ],
  introModal: { steps: [] },
  formScript: '',
  activeCanvas: { type: 'formStep', stepId: 'step-1' },
  selectedFieldIds: NO_SELECTION,
  canvasTool: 'move',
  setupConfig: {
    isComplete: false,
    formType: null,
    hasIntroModal: false,
    introModalSteps: 1,
  },
  isSidebarOpen: true,
  isRightSidebarOpen: true,
  isSimulatorOpen: false,
  isPdfDesignerOpen: false,
  canvasZoom: ZOOM_DEFAULT,
  canvasViewMode: 'canvas',
  sidebarTab: 'fields',
  rightSidebarTab: 'project',
  dragPlacement: null,
  rowDropTarget: null,
  rowDrag: null,
  draggingFieldId: null,
  hoveredTransferTarget: null,
  transferNotice: null,
  isDarkMode: getInitialDarkMode(),
  isLowPerformance: getInitialLowPerformance(),
  lastSavedAt: null,
  isUploadingForm: false,
  setDragPlacement: (placement) => set({ dragPlacement: placement }),
  setRowDropTarget: (target) => set({ rowDropTarget: target }),
  setRowDrag: (drag) => set({ rowDrag: drag }),
  setDraggingFieldId: (fieldId) => set({ draggingFieldId: fieldId }),
  setHoveredTransferTarget: (target) => set({ hoveredTransferTarget: target }),
  dismissTransferNotice: () => set({ transferNotice: null }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  // Plegado lo reemplaza CollapsedRightSidebar. Sin guarda de arrastre: solo lo dispara un boton
  // (un atajo si la necesitaria).
  setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
  // En el store porque lo escribe el panel derecho y lo lee el lienzo. Estado de vista.
  setCanvasViewMode: (mode) => set({ canvasViewMode: mode }),
  setSimulatorOpen: (open) => set({ isSimulatorOpen: open }),
  // El disenador de PDF no entra en activeCanvas (CanvasTarget supone filas y campos). Su diseno
  // vive en usePdfDesignStore.
  setPdfDesignerOpen: (open) => set({ isPdfDesignerOpen: open }),
  // Se recorta aca: la rueda manda valores continuos y los atajos no saben del rango.
  setCanvasZoom: (zoom) => set({ canvasZoom: clampZoom(zoom) }),
  // Estado de vista: no viaja en el borrador y al recargar vuelve a Mover.
  setCanvasTool: (tool) => set({ canvasTool: tool }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab }),
  markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
  setUploadingForm: (uploading) => set({ isUploadingForm: uploading }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
      return { isDarkMode: next }
    }),
  // Estado de vista: no entra al borrador ni crea paso de historial (sameDocument).
  toggleLowPerformance: () =>
    set((state) => {
      const next = !state.isLowPerformance
      window.localStorage.setItem(PERFORMANCE_STORAGE_KEY, next ? 'low' : 'normal')
      return { isLowPerformance: next }
    }),
  selectFieldAndEdit: (fieldId, tab) =>
    set({ selectedFieldIds: [fieldId], sidebarTab: tab, isSidebarOpen: true }),
  completeSetup: (config) => {
    set(() => {
      const formSteps = buildInitialFormSteps(config.formType)
      return {
        setupConfig: { isComplete: true, ...config },
        formSteps,
        introModal: {
          steps: config.hasIntroModal
            ? buildInitialIntroSteps(config.formType, config.introModalSteps)
            : [],
        },
        activeCanvas: { type: 'formStep', stepId: formSteps[0].stepId },
        selectedFieldIds: NO_SELECTION,
      }
    })
    // Un formulario recien armado no se deshace hacia el lienzo en blanco de antes del asistente.
    clearHistory()
  },
  setActiveCanvas: (target) => set({ activeCanvas: target, selectedFieldIds: NO_SELECTION }),
  updateFormStepTitle: (stepId, title) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.stepId === stepId ? { ...step, title } : step,
      ),
    })),
  updateFormStepSubtitle: (stepId, subtitle) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.stepId === stepId ? { ...step, subtitle } : step,
      ),
    })),
  // Se borra en vez de guardar false, igual que las demas banderas opcionales del modelo.
  setFormStepHidden: (stepId, hidden) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => {
        if (step.stepId !== stepId) return step
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se saca de la copia a proposito
        const { hidden: _previous, ...rest } = step
        return hidden ? { ...rest, hidden: true } : rest
      }),
    })),
  addFormStep: () =>
    set((state) => {
      const newStep: FormStep = {
        stepId: uuidv4(),
        title: `Paso ${state.formSteps.length + 1}`,
        rows: [createEmptyRow()],
      }
      return {
        formSteps: [...state.formSteps, newStep],
        activeCanvas: { type: 'formStep', stepId: newStep.stepId },
        selectedFieldIds: NO_SELECTION,
      }
    }),
  // Lo que miraba a sus campos desde otros pasos o desde el modal se limpia como al borrarlos uno a
  // uno: si no, el export sacaba la condicion con el uuid del campo muerto.
  removeFormStep: (stepId) =>
    set((state) => {
      if (state.formSteps.length <= 1) return state
      const removedStep: FormStep | undefined = state.formSteps.find(
        (step) => step.stepId === stepId,
      )
      if (!removedStep) return state
      const remainingSteps = state.formSteps.filter((step) => step.stepId !== stepId)
      const wasActive =
        state.activeCanvas.type === 'formStep' && state.activeCanvas.stepId === stepId
      return {
        ...removeFieldsEverywhere(
          { formSteps: remainingSteps, introModal: state.introModal },
          stepFieldIds(removedStep),
        ),
        activeCanvas: wasActive
          ? { type: 'formStep', stepId: remainingSteps[0].stepId }
          : state.activeCanvas,
        selectedFieldIds: wasActive ? NO_SELECTION : state.selectedFieldIds,
      }
    }),
  updateIntroModalStepTitle: (stepId, title) =>
    set((state) => ({
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.stepId === stepId ? { ...step, title } : step,
        ),
      },
    })),
  updateIntroModalStepSubtitle: (stepId, subtitle) =>
    set((state) => ({
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.stepId === stepId ? { ...step, subtitle } : step,
        ),
      },
    })),
  addIntroModalStep: () =>
    set((state) => {
      const newStep: IntroModalStep = {
        stepId: uuidv4(),
        title: `Paso ${state.introModal.steps.length + 1}`,
        rows: [createEmptyRow()],
      }
      return {
        introModal: { steps: [...state.introModal.steps, newStep] },
        setupConfig: {
          ...state.setupConfig,
          hasIntroModal: true,
          introModalSteps: state.introModal.steps.length + 1,
        },
        activeCanvas: { type: 'introStep', stepId: newStep.stepId },
        selectedFieldIds: NO_SELECTION,
      }
    }),
  // Misma limpieza que al borrar un paso del formulario: el formulario puede depender del modal.
  removeIntroModalStep: (stepId) =>
    set((state) => {
      const removedStep: IntroModalStep | undefined = state.introModal.steps.find(
        (step) => step.stepId === stepId,
      )
      if (!removedStep) return state
      const remainingSteps = state.introModal.steps.filter((step) => step.stepId !== stepId)
      const wasActive =
        state.activeCanvas.type === 'introStep' && state.activeCanvas.stepId === stepId
      return {
        ...removeFieldsEverywhere(
          { formSteps: state.formSteps, introModal: { steps: remainingSteps } },
          stepFieldIds(removedStep),
        ),
        setupConfig: {
          ...state.setupConfig,
          hasIntroModal: remainingSteps.length > 0,
          introModalSteps: remainingSteps.length,
        },
        activeCanvas: wasActive
          ? { type: 'formStep', stepId: state.formSteps[0].stepId }
          : state.activeCanvas,
        selectedFieldIds: wasActive ? NO_SELECTION : state.selectedFieldIds,
      }
    }),
  addRowToActiveCanvas: () =>
    set((state) => {
      const newRow = createEmptyRow()
      const stepId = state.activeCanvas.stepId
      if (state.activeCanvas.type === 'formStep') {
        return {
          formSteps: state.formSteps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
        }
      }
      return {
        introModal: {
          steps: state.introModal.steps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
        },
      }
    }),
  // Clic en la paleta: fila nueva al final del paso activo con el campo, en un solo set (un solo
  // Ctrl+Z). La fila nace fuera de los grupos.
  appendFieldToActiveCanvas: (fieldType) =>
    set((state) => {
      const emptyRow: CanvasRow = createEmptyRow()
      const placement: FieldPlacement | null = resolvePlacement(emptyRow, GRID_BASE_COLUMNS)
      if (!placement) return state
      const newField: CanvasField = createEmptyField(
        fieldType.type,
        fieldType.label,
        placement,
        allFieldNames(state),
      )
      const newRow: CanvasRow = { ...emptyRow, fields: [newField] }
      const stepId: string = state.activeCanvas.stepId
      if (state.activeCanvas.type === 'formStep') {
        return {
          formSteps: state.formSteps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
          selectedFieldIds: [newField.id],
        }
      }
      return {
        introModal: {
          ...state.introModal,
          steps: state.introModal.steps.map((step) =>
            step.stepId === stepId ? { ...step, rows: [...step.rows, newRow] } : step,
          ),
        },
        selectedFieldIds: [newField.id],
      }
    }),
  updateRowColumns: (rowId, columns) =>
    set((state) => {
      const row = findRowById(state, rowId)
      if (!row) return state
      // Nunca menos de una columna por campo: alguno quedaria sin sitio al reempaquetar.
      const nextColumns = Math.max(
        MIN_ROW_COLUMNS,
        Math.min(MAX_ROW_COLUMNS, Math.round(columns)),
        row.fields.length,
      )
      return mapRowEverywhere(state, rowId, (current) => repackRow(current, nextColumns))
    }),
  updateRowStyles: (rowId, updates) =>
    set((state) =>
      mapRowEverywhere(state, rowId, (row) => ({ ...row, styles: { ...row.styles, ...updates } })),
    ),
  removeRow: (rowId) =>
    set((state) => {
      // Los campos se van con la fila: salen de la seleccion (un id colgando haria mentir al
      // contador) y se limpia lo que los miraba.
      const fieldIds: string[] = (findRowById(state, rowId)?.fields ?? []).map((field) => field.id)
      const pruned: StateSlice = removeFieldsEverywhere(state, fieldIds)

      return {
        formSteps: pruned.formSteps.map((step) =>
          pruneEmptyGroups({ ...step, rows: step.rows.filter((row) => row.id !== rowId) }),
        ),
        introModal: {
          steps: pruned.introModal.steps.map((step) => ({
            ...step,
            rows: step.rows.filter((row) => row.id !== rowId),
          })),
        },
        selectedFieldIds: withoutIds(state.selectedFieldIds, new Set<string>(fieldIds)),
      }
    }),
  // Reordenar es mover dentro de rows[]: el orden es el del arreglo. Un destino en otro paso lo
  // rechaza reorderRows.
  moveRow: (rowId, target) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) =>
        step.rows.some((row) => row.id === rowId)
          ? { ...step, rows: reorderRows(step.rows, rowId, target) }
          : step,
      ),
      introModal: {
        steps: state.introModal.steps.map((step) =>
          step.rows.some((row) => row.id === rowId)
            ? { ...step, rows: reorderRows(step.rows, rowId, target) }
            : step,
        ),
      },
    })),
  // Mudar de paso no toca nombre ni id: ninguna referencia se rompe. Varios a la vez en una sola
  // pasada: un solo aviso de cruce y la etiqueta compartida viaja una vez.
  moveFieldsToStep: (fieldIds, target) =>
    set((state) => {
      const rows: CanvasRow[] = allRows(state)
      const targetRows: CanvasRow[] = rowsOfTarget(state, target)
      // Un campo que ya esta en el destino se saltea.
      const alreadyThere: Set<string> = new Set<string>(
        targetRows.flatMap((row) => row.fields.map((field) => field.id)),
      )
      const moving: CanvasField[] = []
      const movingIds: Set<string> = new Set<string>()

      for (const fieldId of fieldIds) {
        if (alreadyThere.has(fieldId)) continue

        for (const field of transferGroup(rows, fieldId)) {
          if (movingIds.has(field.id)) continue
          movingIds.add(field.id)
          moving.push(field)
        }
      }

      if (moving.length === 0) return state
      const strip = (rows: CanvasRow[]): CanvasRow[] =>
        rows.map((row) => {
          const kept = row.fields.filter((field) => !movingIds.has(field.id))

          return kept.length === row.fields.length ? row : { ...row, fields: kept }
        })

      // El destino se limpia antes de plantar: la etiqueta enlazada podia vivir ya ahi y
      // planLanding la duplicaria.
      const landed: CanvasRow[] = planLanding(strip(targetRows), moving, createEmptyRow)
      const notice: string | null = crossingNotice(
        collectCrossingRefs(rowsAcrossFrom(state, target), moving, target.type === 'introStep'),
      )

      return {
        formSteps: state.formSteps.map((step) =>
          target.type === 'formStep' && step.stepId === target.stepId
            ? { ...step, rows: landed }
            : { ...step, rows: strip(step.rows) },
        ),
        introModal: {
          steps: state.introModal.steps.map((step) =>
            target.type === 'introStep' && step.stepId === target.stepId
              ? { ...step, rows: landed }
              : { ...step, rows: strip(step.rows) },
          ),
        },
        // Se va al destino: si no, el campo desaparece y no se sabe si llego.
        activeCanvas: target,
        // Siguen seleccionados los pedidos que estan en el destino; la etiqueta arrastrada, no.
        selectedFieldIds: fieldIds.filter(
          (fieldId) => movingIds.has(fieldId) || alreadyThere.has(fieldId),
        ),
        transferNotice: notice,
      }
    }),
  // La fila se muda entera al final; la posicion se ajusta despues arrastrando.
  moveRowToStep: (rowId, target) =>
    set((state) => {
      const row = findRowById(state, rowId)
      if (!row) return state

      // Como al reordenar: una fila no sale de su grupo arrastrandola. canTransfer pinta la pestana
      // rechazada con la misma regla.
      if (!canTransfer([row], { kind: 'row', rowId }).allowed) return state

      const targetRows: CanvasRow[] = rowsOfTarget(state, target)
      if (targetRows.some((candidate) => candidate.id === rowId)) return state

      const notice: string | null = crossingNotice(
        collectCrossingRefs(rowsAcrossFrom(state, target), row.fields, target.type === 'introStep'),
      )
      const strip = (rows: CanvasRow[]): CanvasRow[] =>
        rows.filter((candidate) => candidate.id !== rowId)

      return {
        formSteps: state.formSteps.map((step) =>
          target.type === 'formStep' && step.stepId === target.stepId
            ? { ...step, rows: [...step.rows, row] }
            : { ...step, rows: strip(step.rows) },
        ),
        introModal: {
          steps: state.introModal.steps.map((step) =>
            target.type === 'introStep' && step.stepId === target.stepId
              ? { ...step, rows: [...step.rows, row] }
              : { ...step, rows: strip(step.rows) },
          ),
        },
        activeCanvas: target,
        transferNotice: notice,
      }
    }),
  addGroupToActiveStep: () =>
    set((state) => {
      if (state.activeCanvas.type !== 'formStep') return state

      const stepId: string = state.activeCanvas.stepId
      const taken: Set<string> = new Set([
        ...allFieldNames(state),
        ...groupNamesInUse(state.formSteps),
      ])
      const group: RepeatableGroup = createRepeatableGroup('Grupo repetible', taken)
      const row: CanvasRow = { ...createEmptyRow(), groupId: group.id }

      return {
        formSteps: state.formSteps.map((step) =>
          step.stepId === stepId
            ? { ...step, rows: [...step.rows, row], groups: [...(step.groups ?? []), group] }
            : step,
        ),
      }
    }),
  addRowToGroup: (groupId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => {
        if (!(step.groups ?? []).some((group) => group.id === groupId)) return step

        const row: CanvasRow = { ...createEmptyRow(), groupId }

        return { ...step, rows: normalizeGroupRows([...step.rows, row]) }
      }),
    })),
  updateGroup: (groupId, updates) =>
    set((state) => {
      const taken: Set<string> = allFieldNames(state)

      for (const step of state.formSteps) {
        for (const group of step.groups ?? []) {
          if (group.id !== groupId) taken.add(group.name)
        }
      }

      return {
        formSteps: state.formSteps.map((step) => {
          const current: RepeatableGroup | undefined = (step.groups ?? []).find(
            (group) => group.id === groupId,
          )

          if (!current) return step

          const merged: RepeatableGroup = { ...current, ...updates }
          const next: RepeatableGroup = {
            ...merged,
            ...clampGroupBounds(merged.min, merged.max),
            name:
              updates.name === undefined
                ? current.name
                : uniqueFieldName(slugifyFieldName(updates.name), taken),
          }
          const movedArray: boolean = next.arrayPath !== current.arrayPath

          return {
            ...step,
            groups: (step.groups ?? []).map((group) => (group.id === groupId ? next : group)),
            // Cambiar el arrayPath invalida el mapeo de todos sus campos: la ruta apuntaba al array
            // anterior.
            rows: movedArray
              ? step.rows.map((row) =>
                  row.groupId === groupId
                    ? {
                        ...row,
                        fields: row.fields.map((field) =>
                          field.apiBinding?.kind === 'mapped'
                            ? { ...field, apiBinding: undefined }
                            : field,
                        ),
                      }
                    : row,
                )
              : step.rows,
          }
        }),
      }
    }),
  removeGroup: (groupId) =>
    set((state) => ({
      formSteps: state.formSteps.map((step) => detachGroup(step, groupId)),
    })),
  addFieldToRow: (rowId, fieldType, requested) =>
    set((state) => {
      const row = findRowById(state, rowId)
      if (!row) return state
      const placement = resolvePlacement(row, GRID_BASE_COLUMNS, requested)
      if (!placement) return state
      const newField = createEmptyField(
        fieldType.type,
        fieldType.label,
        placement,
        allFieldNames(state),
      )
      return {
        ...mapRowEverywhere(state, rowId, (current) => ({
          ...current,
          fields: [...current.fields, newField],
        })),
        selectedFieldIds: [newField.id],
      }
    }),
  // Varios en una sola pasada: un estado nuevo, y cada condicion que apuntaba a un borrado se
  // limpia (removeFieldsEverywhere).
  removeFields: (fieldIds) =>
    set((state) => {
      const removed: Set<string> = new Set<string>(fieldIds)
      if (removed.size === 0) return state

      return {
        ...removeFieldsEverywhere(state, fieldIds),
        selectedFieldIds: withoutIds(state.selectedFieldIds, removed),
      }
    }),
  moveField: (fieldId, targetRowId, requested) =>
    set((state) => {
      const movedField = findAnyField(state, fieldId)
      const targetRow = findRowById(state, targetRowId)
      if (!movedField || !targetRow) return state

      // Sin hueco valido se descarta entero: nunca se desplaza a un vecino.
      const placement = resolvePlacement(targetRow, movedField.colSpan, requested, fieldId)
      if (!placement) return state

      // Sacar un campo de un grupo le quita el mapeo: su ruta (actividades[].algo) no significa
      // nada fuera.
      const sourceRow = findRowContainingField(state, fieldId)
      const leavesItemScope: boolean =
        sourceRow?.groupId !== targetRow.groupId && movedField.apiBinding?.kind === 'mapped'
      // Un concepto no vive en un grupo (la lista es plana): queda excluido, no suelto, y conserva
      // sus opciones a mano.
      const entersGroupAsConcept: boolean =
        targetRow.groupId !== undefined && movedField.apiBinding?.kind === 'concept'

      const placed: CanvasField = {
        ...movedField,
        ...placement,
        apiBinding: leavesItemScope
          ? undefined
          : entersGroupAsConcept
            ? { kind: 'excluded' }
            : movedField.apiBinding,
      }
      const applyTo = (rows: CanvasRow[]): CanvasRow[] =>
        rows.map((row) => {
          const withoutField = row.fields.filter((f) => f.id !== fieldId)
          if (row.id !== targetRowId) {
            return withoutField.length === row.fields.length
              ? row
              : { ...row, fields: withoutField }
          }
          return { ...row, fields: sortByColumn([...withoutField, placed]) }
        })

      return {
        formSteps: state.formSteps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        introModal: {
          steps: state.introModal.steps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        },
      }
    }),
  setFieldName: (fieldId, name) =>
    set((state) => {
      const slug: string = slugifyFieldName(name)
      const unique: string = uniqueFieldName(slug, allFieldNames(state, fieldId))

      return mapFieldEverywhere(state, fieldId, (field) => ({ ...field, name: unique }))
    }),

  setFieldContent: (fieldId, content) =>
    set((state) => mapFieldEverywhere(state, fieldId, (field) => ({ ...field, content }))),

  // El vinculo vive en la etiqueta: un solo extremo. Uno a uno: la que ya apuntaba a ese campo se
  // desvincula. hasLinkedLabel lo deduce.
  setFieldLabelFor: (labelId, targetFieldId) =>
    set((state) => {
      const applyTo = (rows: CanvasRow[]) =>
        rows.map((row) => ({
          ...row,
          fields: row.fields.map((field) => {
            if (field.id === labelId) {
              return { ...field, labelFor: targetFieldId ?? undefined }
            }

            const stealsTarget: boolean = targetFieldId !== null && field.labelFor === targetFieldId

            return stealsTarget ? { ...field, labelFor: undefined } : field
          }),
        }))

      return {
        formSteps: state.formSteps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        introModal: {
          steps: state.introModal.steps.map((step) => ({ ...step, rows: applyTo(step.rows) })),
        },
      }
    }),
  setFieldEnableWhen: (fieldId, condition) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        enableWhen: condition ?? undefined,
      })),
    ),
  setFieldVisibleWhen: (fieldId, condition) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        visibleWhen: condition ?? undefined,
      })),
    ),
  updateFieldApiBinding: (fieldId, binding, optionsSetup) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => {
        const next: CanvasField = { ...field, apiBinding: binding ?? undefined }
        if (!isOptionBasedField(next.type)) return next

        if (!allowsManualOptions(next)) {
          next.options = undefined
          return next
        }

        if (optionsSetup) {
          next.title = optionsSetup.title?.trim() || undefined
          next.options = createOptions(optionsSetup.optionCount)
        }
        return next
      }),
    ),
  // Declarar un catalogo descarta las opciones a mano: el JSON ya no las podria llevar.
  updateFieldDataSource: (fieldId, dataSource) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => {
        const next: CanvasField = { ...field, dataSource: dataSource ?? undefined }
        if (isOptionBasedField(next.type) && !allowsManualOptions(next)) next.options = undefined

        return next
      }),
    ),
  // Reemplaza la seleccion (clic comun). Elegir lo ya elegido devuelve el mismo estado: ninguna
  // fila se redibuja.
  selectField: (fieldId) =>
    set((state) => {
      const current: string[] = state.selectedFieldIds

      if (fieldId === null) {
        return current.length === 0 ? state : { selectedFieldIds: NO_SELECTION }
      }

      return current.length === 1 && current[0] === fieldId
        ? state
        : { selectedFieldIds: [fieldId] }
    }),
  toggleFieldSelection: (fieldId) =>
    set((state) => ({ selectedFieldIds: toggleId(state.selectedFieldIds, fieldId) })),
  // La escribe el marco en cada movimiento: solo llega al store si el conjunto cambio.
  setFieldSelection: (fieldIds) =>
    set((state) =>
      sameIdSet(state.selectedFieldIds, fieldIds) ? state : { selectedFieldIds: fieldIds },
    ),
  updateField: (fieldId, updates) =>
    set((state) => {
      if (updates.colSpan === undefined) {
        return mapFieldEverywhere(state, fieldId, (field) => ({ ...field, ...updates }))
      }
      const row = findRowContainingField(state, fieldId)
      if (!row) return state
      const maxSpan = getMaxSpanAt(
        getFreeRuns(row.fields, row.columns, fieldId),
        row.fields.find((f) => f.id === fieldId)?.colStart ?? 1,
      )
      return mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        ...updates,
        colSpan: Math.max(1, Math.min(updates.colSpan ?? field.colSpan, maxSpan)),
      }))
    }),
  updateFieldValidations: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: { ...field.validations, ...updates },
      })),
    ),
  addFieldValidationOverride: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: [...(field.validations.overrides ?? []), createValidationOverride()],
        },
      })),
    ),
  updateFieldValidationOverride: (fieldId, overrideId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: (field.validations.overrides ?? []).map((override) =>
            override.id === overrideId
              ? {
                  ...override,
                  ...updates,
                  // Se fusionan: el panel manda una regla por vez.
                  validations: { ...override.validations, ...updates.validations },
                }
              : override,
          ),
        },
      })),
    ),
  removeFieldValidationOverride: (fieldId, overrideId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        validations: {
          ...field.validations,
          overrides: (field.validations.overrides ?? []).filter(
            (override) => override.id !== overrideId,
          ),
        },
      })),
    ),
  updateFieldStyles: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        styles: { ...field.styles, ...updates },
      })),
    ),
  // Un script en blanco se guarda como ausente: el export no lleva la clave.
  setFieldScript: (fieldId, script) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, script: script.trim().length > 0 ? script : undefined },
      })),
    ),
  setFormScript: (script) => set({ formScript: script }),
  addFieldRule: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, rules: [...(field.logic.rules ?? []), createFieldRule()] },
      })),
    ),
  updateFieldRule: (fieldId, ruleId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: {
          ...field.logic,
          rules: (field.logic.rules ?? []).map((rule) =>
            rule.id === ruleId ? { ...rule, ...updates } : rule,
          ),
        },
      })),
    ),
  removeFieldRule: (fieldId, ruleId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: {
          ...field.logic,
          rules: (field.logic.rules ?? []).filter((rule) => rule.id !== ruleId),
        },
      })),
    ),
  reorderFieldRule: (fieldId, ruleId, offset) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        logic: { ...field.logic, rules: moveRule(field.logic.rules ?? [], ruleId, offset) },
      })),
    ),
  updateFieldFileConfig: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        fileConfig: {
          acceptedFormats: field.fileConfig?.acceptedFormats ?? [],
          maxSizeMB: field.fileConfig?.maxSizeMB ?? 10,
          ...updates,
        },
      })),
    ),
  // Apagarlos borra la clave: ausente y false son lo mismo.
  setFieldRounding: (fieldId, rounding) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        rounding: rounding || undefined,
      })),
    ),
  setFieldFormatted: (fieldId, formatted) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        formatted: formatted || undefined,
      })),
    ),
  setFieldInlineOptions: (fieldId, inline) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        inlineOptions: inline || undefined,
      })),
    ),
  setFieldDateRange: (fieldId, range) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        dateRange: range || undefined,
      })),
    ),
  setFieldIncludesTime: (fieldId, withTime) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        includesTime: withTime || undefined,
      })),
    ),
  setFieldDateFormat: (fieldId, format) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        dateFormat: format ?? undefined,
      })),
    ),
  // null es "los que traiga": la ausencia de la clave no es un cero.
  setFieldDecimals: (fieldId, decimals) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        decimals: decimals ?? undefined,
      })),
    ),
  // Lo tecleado sin recortar; vaciarlo borra la clave (lib/fieldAffix).
  setFieldAffix: (fieldId, side, text) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        [side]: text === '' ? undefined : text,
      })),
    ),
  // Como los afijos: lo tecleado, y vacio borra la clave.
  setFieldPlaceholder: (fieldId, text) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        placeholder: text === '' ? undefined : text,
      })),
    ),
  // Una entrada por linea, sin recortar (lib/fieldSuggestions).
  setFieldSuggestions: (fieldId, text) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        suggestions: parseSuggestionsText(text),
      })),
    ),
  // Celular es el default y no se guarda: solo fijo y fax dejan la clave.
  setFieldPhoneKind: (fieldId, kind) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        phoneKind: kind === 'celular' ? undefined : kind,
      })),
    ),
  // Guarda el false y borra el true: lo que se dice es la restriccion.
  setFieldAllowsNegative: (fieldId, allows) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        allowsNegative: allows ? undefined : false,
      })),
    ),
  updateFieldTooltip: (fieldId, updates) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        tooltip: updates ? { ...(field.tooltip ?? createEmptyTooltip()), ...updates } : undefined,
      })),
    ),
  addFieldOption: (fieldId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: [
          ...(field.options ?? []),
          { id: uuidv4(), label: `Opción ${(field.options?.length ?? 0) + 1}` },
        ],
      })),
    ),
  removeFieldOption: (fieldId, optionId) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: (field.options ?? []).filter((option) => option.id !== optionId),
      })),
    ),
  updateFieldOptionLabel: (fieldId, optionId, label) =>
    set((state) =>
      mapFieldEverywhere(state, fieldId, (field) => ({
        ...field,
        options: (field.options ?? []).map((option) =>
          option.id === optionId ? { ...option, label } : option,
        ),
      })),
    ),
  restoreDraft: (draft) => {
    set({
      formSteps: draft.formSteps,
      introModal: draft.introModal,
      formScript: draft.formScript,
      setupConfig: draft.setupConfig,
      activeCanvas: { type: 'formStep', stepId: draft.formSteps[0].stepId },
      selectedFieldIds: NO_SELECTION,
    })
    // Deshacer no puede volver al lienzo de antes de recuperar el borrador.
    clearHistory()
  },
  undo: () => travelHistory('undo'),
  redo: () => travelHistory('redo'),
})

const HISTORY_OPTIONS: ZundoOptions<FormState, HistorySnapshot> = {
  partialize: toHistorySnapshot,
  equality: sameDocument,
  limit: HISTORY_LIMIT,
  // handleSet recibe la funcion que guarda el paso; la compuerta decide cuales llegan.
  handleSet: (handleSet) =>
    historyGate.wrap((pastState: HistoryPastState): void => handleSet(pastState)),
}

export const useFormStore: UseBoundStore<
  Mutate<StoreApi<FormState>, [['temporal', StoreApi<TemporalState<HistorySnapshot>>]]>
> = create<FormState>()(temporal(createFormState, HISTORY_OPTIONS))

// Deshacer y rehacer escriben con el set crudo de zundo: no son pasos nuevos. Despues se reconcilia
// la vista; esa escritura solo toca la vista y el historial la descarta.
function travelHistory(direction: 'undo' | 'redo'): void {
  historyGate.reset()

  const temporalState: TemporalState<HistorySnapshot> = useFormStore.temporal.getState()
  if (direction === 'undo') temporalState.undo()
  else temporalState.redo()

  useFormStore.setState(reconcileViewAfterHistory)
}

function clearHistory(): void {
  historyGate.reset()
  useFormStore.temporal.getState().clear()
}

// Devuelven NO_ROWS / NO_GROUPS y no un [] nuevo: Zustand compara por identidad.
export function getActiveRows(state: {
  formSteps: FormStep[]
  introModal: IntroModalState
  activeCanvas: CanvasTarget
}): CanvasRow[] {
  const activeCanvas = state.activeCanvas

  if (activeCanvas.type === 'formStep') {
    const step = state.formSteps.find((s) => s.stepId === activeCanvas.stepId)
    return step ? step.rows : NO_ROWS
  }

  const step = state.introModal.steps.find((s) => s.stepId === activeCanvas.stepId)

  return step ? step.rows : NO_ROWS
}

export function getActiveGroups(state: {
  formSteps: FormStep[]
  activeCanvas: CanvasTarget
}): RepeatableGroup[] {
  // El modal de intro no admite grupos repetibles.
  if (state.activeCanvas.type !== 'formStep') return NO_GROUPS

  const step = state.formSteps.find((s) => s.stepId === state.activeCanvas.stepId)

  return step?.groups ?? NO_GROUPS
}

// Su id con exactamente uno seleccionado; null con ninguno o varios. Primitivo: estable para
// useSyncExternalStore.
export function getSelectedFieldId(state: { selectedFieldIds: string[] }): string | null {
  return state.selectedFieldIds.length === 1 ? state.selectedFieldIds[0] : null
}

export function findGroupForField(
  state: StateSlice,
  fieldId: string | null,
): RepeatableGroup | null {
  if (!fieldId) return null

  for (const step of state.formSteps) {
    const row = step.rows.find((r) => r.fields.some((f) => f.id === fieldId))
    if (!row) continue

    return (step.groups ?? []).find((group) => group.id === row.groupId) ?? null
  }

  return null
}

export { findFieldById } from './formStore.utils'

export function getAllFields(rows: CanvasRow[]): CanvasField[] {
  return rows.flatMap((row) => row.fields)
}

export function findRowContainingField(
  state: { formSteps: FormStep[]; introModal: IntroModalState },
  fieldId: string | null,
): CanvasRow | null {
  if (!fieldId) return null
  for (const step of state.formSteps) {
    for (const row of step.rows) {
      if (row.fields.some((f) => f.id === fieldId)) return row
    }
  }

  for (const step of state.introModal.steps) {
    for (const row of step.rows) {
      if (row.fields.some((f) => f.id === fieldId)) return row
    }
  }

  return null
}
