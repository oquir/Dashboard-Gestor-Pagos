import type { CanvasField } from '../../../types'
import type { CanvasRow, RepeatableGroup } from '../../../types'

export interface RepeatableGroupBandProps {
  group: RepeatableGroup
  rows: CanvasRow[]
  linkedLabels: Map<string, CanvasField>
  // La banda se aparta entera con una fila suelta; rowOffsets solo al reordenar dentro del grupo.
  offsetY?: number
  // Escalona su entrada (ENTER_ROW_CLASSES).
  enterIndex?: number
  rowOffsets?: Map<string, number>
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void
}
