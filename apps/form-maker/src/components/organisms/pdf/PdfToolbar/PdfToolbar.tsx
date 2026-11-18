import { useMemo } from 'react'
import { Xmark } from 'reicon-react'
import { useStore } from 'zustand'
import {
  CANVAS_SELECTION_COUNT_CLASSES,
  CANVAS_TOOLBAR_ACTION_CLASSES,
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

// La barra flotante del diseñador de PDF: la misma del lienzo del formulario (CanvasToolbar) con las
// mismas piezas, sin + Fila ni + Grupo repetible, que no existen aca, y con el zoom del lienzo. Va como hermana del area que
// hace scroll y no adentro, para que no se desplace con las hojas. La herramienta y el historial son
// los del store del PDF (usePdfDesignStore), no los del formulario.
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
            <span className={CANVAS_SELECTION_COUNT_CLASSES}>{selectedCount} celdas</span>
            <Tooltip content="Combinar las celdas seleccionadas en una">
              <button
                type="button"
                onClick={mergeSelection}
                className={CANVAS_TOOLBAR_ACTION_CLASSES}
              >
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
