import { useEffect, useState } from 'react'
import { Layers, Plus, Trash6, Xmark } from 'reicon-react'
import {
  CANVAS_SELECTION_COUNT_CLASSES,
  CANVAS_TOOLBAR_ACTION_CLASSES,
  CANVAS_TOOLBAR_DIVIDER_CLASSES,
  CANVAS_TOOLBAR_GROUP_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../constants/uiClasses'
import { useFormHistory } from '../../../hooks/useFormHistory/useFormHistory'
import { revealScrollBehavior } from '../../../lib'
import { getBandElement, getRowElement } from '../../../lib/canvasDom/canvasDom'
import { getActiveGroups, getActiveRows, useFormStore } from '../../../store/formStore'
import type { CanvasRow, RepeatableGroup } from '../../../types/formStructure'
import { MoveToStepMenu } from '../MoveToStepMenu/MoveToStepMenu'
import {
  TOOLBAR_CLASSES,
  TOOLBAR_COMPACT_LABEL_CLASSES,
  TOOLBAR_DANGER_CLASSES,
  TOOLBAR_LAYER_CLASSES,
} from './CanvasToolbar.constants'
import type { CanvasReveal } from './CanvasToolbar.types'
import { CanvasToolPicker, HistoryButtons, PerformanceModeToggle } from '../../molecules'
import { Tooltip } from '../../atoms'

export function CanvasToolbar() {
  const viewMode = useFormStore((state) => state.canvasViewMode)
  const canvasTool = useFormStore((state) => state.canvasTool)
  const setCanvasTool = useFormStore((state) => state.setCanvasTool)
  const isIntro = useFormStore((state) => state.activeCanvas.type === 'introStep')
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds)
  const addRowToActiveCanvas = useFormStore((state) => state.addRowToActiveCanvas)
  const addGroupToActiveStep = useFormStore((state) => state.addGroupToActiveStep)
  const selectField = useFormStore((state) => state.selectField)
  const removeFields = useFormStore((state) => state.removeFields)
  const moveFieldsToStep = useFormStore((state) => state.moveFieldsToStep)
  const { canUndo, canRedo, undo, redo } = useFormHistory()
  // Lo agregado cae al final del paso, que con la barra flotando puede quedar lejos de lo que se
  // esta mirando. La vista se lleva hasta ahi despues del commit, cuando el nodo nuevo ya existe.
  const [pendingReveal, setPendingReveal] = useState<CanvasReveal | null>(null)

  useEffect(() => {
    if (!pendingReveal) return

    const element: HTMLElement | null =
      pendingReveal.kind === 'row'
        ? getRowElement(pendingReveal.id)
        : getBandElement(pendingReveal.id)

    element?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: revealScrollBehavior(useFormStore.getState().isLowPerformance),
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect -- consume el reveal pendiente despues del commit
    setPendingReveal(null)
  }, [pendingReveal])

  function handleAddRow(): void {
    const before: number = getActiveRows(useFormStore.getState()).length
    addRowToActiveCanvas()

    const rows: CanvasRow[] = getActiveRows(useFormStore.getState())
    if (rows.length > before) setPendingReveal({ kind: 'row', id: rows[rows.length - 1].id })
  }

  function handleAddGroup(): void {
    const before: number = getActiveGroups(useFormStore.getState()).length
    addGroupToActiveStep()

    const groups: RepeatableGroup[] = getActiveGroups(useFormStore.getState())
    if (groups.length > before) {
      setPendingReveal({ kind: 'band', id: groups[groups.length - 1].id })
    }
  }

  if (viewMode !== 'canvas') return null

  const hasMultiSelection: boolean = selectedFieldIds.length > 1
  const labelClasses: string = hasMultiSelection ? TOOLBAR_COMPACT_LABEL_CLASSES : ''

  return (
    <div className={TOOLBAR_LAYER_CLASSES}>
      <div role="toolbar" aria-label="Herramientas del lienzo" className={TOOLBAR_CLASSES}>
        <CanvasToolPicker tool={canvasTool} onSelect={setCanvasTool} />

        <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

        <div className={CANVAS_TOOLBAR_GROUP_CLASSES}>
          <Tooltip content="Agregar una fila al final del paso">
            <button
              type="button"
              onClick={handleAddRow}
              aria-label="Agregar fila"
              className={CANVAS_TOOLBAR_ACTION_CLASSES}
            >
              <Plus size={12} weight="Filled" /> <span className={labelClasses}>Fila</span>
            </button>
          </Tooltip>
          {/* Deshabilitado y no oculto en el modal de entrada: la barra no cambia de ancho al pasar
            de un lienzo al otro. */}
          <Tooltip
            content={
              isIntro
                ? 'Los grupos repetibles solo existen en los pasos del formulario'
                : 'Un bloque que el contribuyente puede repetir varias veces'
            }
          >
            <span className="inline-flex">
              <button
                type="button"
                onClick={handleAddGroup}
                disabled={isIntro}
                aria-label="Agregar grupo repetible"
                className={CANVAS_TOOLBAR_ACTION_CLASSES}
              >
                <Layers size={12} weight="Filled" />{' '}
                <span className={labelClasses}>Grupo repetible</span>
              </button>
            </span>
          </Tooltip>
        </div>

        <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

        <HistoryButtons canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />

        <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

        <PerformanceModeToggle />

        {hasMultiSelection && (
          <>
            <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

            <div className={CANVAS_TOOLBAR_GROUP_CLASSES}>
              <span className={CANVAS_SELECTION_COUNT_CLASSES}>
                {selectedFieldIds.length} seleccionados
              </span>
              <MoveToStepMenu onSelect={(target) => moveFieldsToStep(selectedFieldIds, target)} />
              <Tooltip content="Eliminar los campos seleccionados (Supr)">
                <button
                  type="button"
                  onClick={() => removeFields(selectedFieldIds)}
                  aria-label="Eliminar los campos seleccionados"
                  className={TOOLBAR_DANGER_CLASSES}
                >
                  <Trash6 size={15} />
                </button>
              </Tooltip>
              <Tooltip content="Deseleccionar (Esc)">
                <button
                  type="button"
                  onClick={() => selectField(null)}
                  aria-label="Deseleccionar"
                  className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES}
                >
                  <Xmark size={12} weight="Filled" />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
