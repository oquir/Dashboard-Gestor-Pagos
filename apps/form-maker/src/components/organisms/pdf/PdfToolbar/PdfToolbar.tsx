import { useMemo } from 'react'
import { Xmark } from 'reicon-react'
import { useStore } from 'zustand'
import {
  CANVAS_TOOLBAR_CLASSES,
  CANVAS_TOOLBAR_DIVIDER_CLASSES,
  CANVAS_TOOLBAR_GROUP_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../../constants'
import { selectedCellIds } from '../../../../lib/pdfDesignEdit'
import { usePdfDesignStore } from '../../../../store/pdfDesignStore'
import { Tooltip } from '../../../atoms'
import { CanvasToolPicker, HistoryButtons, PerformanceModeToggle } from '../../../molecules'
import { PdfZoomControl } from '../PdfZoomControl'
import { MERGE_BUTTON_CLASSES, SELECTION_COUNT_CLASSES } from './PdfToolbar.constants'

// La misma barra que la del formulario, sin + Fila ni + Grupo repetible y con zoom. Va fuera del
// area que hace scroll; herramienta e historial son los de usePdfDesignStore.
export function PdfToolbar() {
  const tool = usePdfDesignStore((state) => state.tool)
  const setTool = usePdfDesignStore((state) => state.setTool)
  const design = usePdfDesignStore((state) => state.design)
  const selection = usePdfDesignStore((state) => state.selection)
  const undo = usePdfDesignStore((state) => state.undo)
  const redo = usePdfDesignStore((state) => state.redo)
  const mergeSelection = usePdfDesignStore((state) => state.mergeSelection)
  const clearSelection = usePdfDesignStore((state) => state.clearSelection)
  const canUndo: boolean = useStore(
    usePdfDesignStore.temporal,
    (temporal) => temporal.pastStates.length > 0,
  )
  const canRedo: boolean = useStore(
    usePdfDesignStore.temporal,
    (temporal) => temporal.futureStates.length > 0,
  )

  const selectedCount: number = useMemo(
    () => (design ? selectedCellIds(design, selection).length : 0),
    [design, selection],
  )

  return (
    <div role="toolbar" aria-label="Herramientas del PDF" className={CANVAS_TOOLBAR_CLASSES}>
      <CanvasToolPicker tool={tool} onSelect={setTool} />

      <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

      <HistoryButtons canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} />

      <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

      <PdfZoomControl />

      <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

      <PerformanceModeToggle />

      {selectedCount > 1 && (
        <>
          <span aria-hidden className={CANVAS_TOOLBAR_DIVIDER_CLASSES} />

          <div className={CANVAS_TOOLBAR_GROUP_CLASSES}>
            <span className={SELECTION_COUNT_CLASSES}>{selectedCount} celdas</span>
            <Tooltip content="Combinar las celdas seleccionadas en una">
              <button type="button" onClick={mergeSelection} className={MERGE_BUTTON_CLASSES}>
                Combinar
              </button>
            </Tooltip>
            <Tooltip content="Deseleccionar (Esc)">
              <button
                type="button"
                onClick={clearSelection}
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
