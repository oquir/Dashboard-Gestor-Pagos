import { SortV } from 'reicon-react'
import { ROW_TOOLBAR_ICON_ITEM_CLASSES } from '../../../constants'
import type { RowDragHandleProps } from './RowDragHandle.types'

export function RowDragHandle({ listeners, attributes }: RowDragHandleProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      title="Arrastrar para reordenar la fila"
      className={`${ROW_TOOLBAR_ICON_ITEM_CLASSES} cursor-grab active:cursor-grabbing active:text-brand-fg`}
    >
      <SortV size={12} />
    </div>
  )
}
