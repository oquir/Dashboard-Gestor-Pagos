import type { IconComponent } from 'reicon-react'
import { Code12, Grid, Hierarchy22 } from 'reicon-react'
import type { CanvasViewMode } from '../../../types'

export const VIEW_MODE_ICONS: Record<CanvasViewMode, IconComponent> = {
  canvas: Grid,
  json: Code12,
  payload: Hierarchy22,
}
