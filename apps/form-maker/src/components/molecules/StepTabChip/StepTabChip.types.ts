import type { CanvasTarget } from '../../../types'
import type { TransferTabState } from '../../../types'

export interface StepTabChipProps {
  index: number
  label: string
  active: boolean
  canvasTarget: CanvasTarget
  // idle sin arrastre; ready si puede recibir la mudanza; rejected si lo arrastrado no puede salir
  // de su paso.
  transferState?: TransferTabState
  onSelect: () => void
  onRemove?: () => void
  removeTitle?: string
  removeIconSize?: number
  className?: string
}
