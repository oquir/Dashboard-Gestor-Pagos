import { useEffect, useState } from 'react'
import { Layers, Plus, Redo, Trash6, Undo, Xmark } from 'reicon-react'
import { CANVAS_TOOLS } from '../../../constants/canvasTool'
import {
  CANVAS_TOOLBAR_ACTION_CLASSES,
  CANVAS_TOOLBAR_DIVIDER_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../constants/uiClasses'
import { useFormHistory } from '../../../hooks/useFormHistory/useFormHistory'
import { revealScrollBehavior } from '../../../lib'
import { getBandElement, getRowElement } from '../../../lib/canvasDom/canvasDom'
import { getActiveGroups, getActiveRows, useFormStore } from '../../../store/formStore'
import type { CanvasRow, RepeatableGroup } from '../../../types/formStructure'
import { MoveToStepMenu } from '../MoveToStepMenu/MoveToStepMenu'
import {
  SELECTION_COUNT_CLASSES,
  TOOL_BUTTON_ACTIVE_CLASSES,
  TOOL_BUTTON_BASE_CLASSES,
  TOOL_BUTTON_INACTIVE_CLASSES,
  TOOL_ICONS,
  TOOLBAR_CLASSES,
  TOOLBAR_DANGER_CLASSES,
  TOOLBAR_GROUP_CLASSES,
} from './CanvasToolbar.constants'
import type { CanvasReveal } from './CanvasToolbar.types'
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

  return (
    <div role="toolbar" aria-label="Herramientas del lienzo" className={TOOLBAR_CLASSES}>
      <div className={TOOLBAR_GROUP_CLASSES}>
        {CANVAS_TOOLS.map((item) => {
          const Icon = TOOL_ICONS[item.tool]
          const isActive: boolean = canvasTool === item.tool

          return (
            <Tooltip key={item.tool} content={`${item.label} (${item.shortcut})`}>
              <button
                type="button"
                onClick={() => setCanvasTool(item.tool)}
                aria-pressed={isActive}
                aria-label={item.label}
                className={`${TOOL_BUTTON_BASE_CLASSES} ${
                  isActive ? TOOL_BUTTON_ACTIVE_CLASSES : TOOL_BUTTON_INACTIVE_CLASSES
                }`}
              >
                <Icon size={16} />
              </button>
            </Tooltip>
          )
        })}
      </div>

      <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

      <div className={TOOLBAR_GROUP_CLASSES}>
        <Tooltip content="Agregar una fila al final del paso">
          <button type="button" onClick={handleAddRow} className={CANVAS_TOOLBAR_ACTION_CLASSES}>
            <Plus size={12} weight="Filled" /> Fila
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
              className={CANVAS_TOOLBAR_ACTION_CLASSES}
            >
              <Layers size={12} weight="Filled" /> Grupo repetible
            </button>
          </span>
        </Tooltip>
      </div>

      <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

      <div className={TOOLBAR_GROUP_CLASSES}>
        <Tooltip content="Deshacer (Ctrl+Z)">
          <span className="inline-flex">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Deshacer"
              className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES}
            >
              <Undo size={15} />
            </button>
          </span>
        </Tooltip>
        <Tooltip content="Rehacer (Ctrl+Y)">
          <span className="inline-flex">
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Rehacer"
              className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES}
            >
              <Redo size={15} />
            </button>
          </span>
        </Tooltip>
      </div>

      {selectedFieldIds.length > 1 && (
        <>
          <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

          <div className={TOOLBAR_GROUP_CLASSES}>
            <span className={SELECTION_COUNT_CLASSES}>{selectedFieldIds.length} seleccionados</span>
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
  )
}
