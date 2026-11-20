import type { IconComponent } from 'reicon-react'
import { Cursor, Hand, VectorSquare } from 'reicon-react'
import type { CanvasTool } from '../../../types/ui'

export const TOOL_ICONS: Record<CanvasTool, IconComponent> = {
  move: Cursor,
  select: VectorSquare,
  hand: Hand,
}
