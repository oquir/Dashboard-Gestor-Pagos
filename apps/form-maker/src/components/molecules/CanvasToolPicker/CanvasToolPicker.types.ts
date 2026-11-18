import type { CanvasTool } from '../../../types/ui'

export interface CanvasToolPickerProps {
  tool: CanvasTool
  onSelect: (tool: CanvasTool) => void
}
