import type { CanvasTool } from '../../../types'

export const TOOL_ROOT_CLASSES: Record<CanvasTool, string> = {
  move: '',
  select: 'cursor-crosshair select-none',
  hand: 'cursor-grab select-none active:cursor-grabbing',
}
