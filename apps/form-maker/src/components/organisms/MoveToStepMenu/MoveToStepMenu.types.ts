import type { CanvasTarget } from '../../../types'

export interface MoveToStepMenuProps {
  onSelect: (target: CanvasTarget) => void
}

export interface MoveTargetOption {
  target: CanvasTarget
  // El numero de la pestana, calculado antes de quitar el activo: el paso 3 sigue diciendo 3.
  number: number
  title: string
}

export interface MoveTargetSection {
  key: CanvasTarget['type']
  caption: string | null
  options: MoveTargetOption[]
}
