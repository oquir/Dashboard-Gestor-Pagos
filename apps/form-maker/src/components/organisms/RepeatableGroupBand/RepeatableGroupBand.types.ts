import type { CanvasField } from '../../../types'
import type { CanvasRow, RepeatableGroup } from '../../../types'

export interface RepeatableGroupBandProps {
  group: RepeatableGroup
  rows: CanvasRow[]
  linkedLabels: Map<string, CanvasField>
  // La banda se aparta entera cuando pasa una fila suelta; rowOffsets solo tiene algo cuando se
  // reordena dentro del grupo, que es el unico caso en que sus filas se mueven por separado.
  offsetY?: number
  // Posicion de la banda en el lienzo: escalona su entrada (ENTER_ROW_CLASSES).
  enterIndex?: number
  rowOffsets?: Map<string, number>
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void
}
