import type { CanvasField } from '../../../types'
import type { CanvasRow } from '../../../types'

export interface CanvasRowProps {
  row: CanvasRow
  // Indexado por el id del campo al que la etiqueta apunta, no por el de la etiqueta.
  linkedLabels: Map<string, CanvasField>
  // Cuanto se aparta esta fila, en px, para dejar pasar a la que se esta arrastrando.
  offsetY?: number
  // Posicion del bloque en el lienzo: escalona la entrada (animate-row-in). Sin el, la fila no se
  // anima: las de dentro de una banda ya entran con ella.
  enterIndex?: number
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void
}

export interface RowBorderState {
  isOver: boolean
  isEmpty: boolean
  // La fila contiene el campo seleccionado, asi que se queda marcada sin hover.
  pinned: boolean
}
