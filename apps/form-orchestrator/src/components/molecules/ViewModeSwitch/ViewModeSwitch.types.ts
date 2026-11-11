import type { CanvasViewMode } from '../../../types'

export interface ViewModeSwitchProps {
  activeMode: CanvasViewMode
  onSelect: (mode: CanvasViewMode) => void
}
