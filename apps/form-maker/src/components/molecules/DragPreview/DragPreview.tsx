import { useFormStore } from '../../../store'
import { RowDragPreview } from '../RowDragPreview'
import type { DragPreviewProps } from './DragPreview.types'
import { getDragLabel } from './DragPreview.utils'

export function DragPreview({ activeDrag }: DragPreviewProps) {
  const rowDrag = useFormStore((state) => state.rowDrag)
  const canvasZoom = useFormStore((state) => state.canvasZoom)
  const hoveredTransferTarget = useFormStore((state) => state.hoveredTransferTarget)
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)

  // Sobre una pestana la fila se encoge a la ficha: dibujada a tamano real tapa la tira entera de
  // pestanas y no se ve cual esta resaltada, que es justo lo que hay que mirar ahi. En bajo
  // rendimiento es ficha todo el viaje: la replica copia cada campo con su control de muestra y su
  // sombra grande, y se repinta en cada movimiento del puntero. useDragAndDrop elige el modificador
  // del overlay con la misma condicion.
  if (
    activeDrag.source === 'canvas-row' &&
    rowDrag &&
    !hoveredTransferTarget &&
    !isLowPerformance
  ) {
    return <RowDragPreview row={activeDrag.row} width={rowDrag.width} scale={canvasZoom} />
  }

  return (
    <div className="whitespace-nowrap rounded-md border border-brand bg-white px-3 py-2 text-center text-xs font-medium text-slate-600 shadow-lg dark:bg-neutral-800 dark:text-neutral-200">
      {getDragLabel(activeDrag)}
    </div>
  )
}
