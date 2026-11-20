import type { useDraggable } from '@dnd-kit/core'
import type { CanvasRow } from '../../../types'

type DraggableHandle = ReturnType<typeof useDraggable>

export type RowToolbarMenu = 'columns' | 'styles'

export interface RowToolbarProps {
  row: CanvasRow
  listeners?: DraggableHandle['listeners']
  attributes?: DraggableHandle['attributes']
  pinned: boolean
}
