import type { CanvasField } from '../../../types'
import type { CanvasRow } from '../../../types'

export interface CanvasRowProps {
  row: CanvasRow
  // Indexado por el id del campo al que la etiqueta apunta, no por el de la etiqueta.
  linkedLabels: Map<string, CanvasField>
  // Desplazamiento en px para dejar pasar la fila arrastrada.
  offsetY?: number
  // Escalona la entrada; sin el no se anima (las filas de una banda entran con ella).
  enterIndex?: number
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void
}

export interface RowBorderState {
  isOver: boolean
  isEmpty: boolean
  pinned: boolean
}
