import type { ComponentType } from 'react'
import type { CanvasField } from '../../../../types'
import type { IconProps } from '../../../../types'

export interface FieldTooltipEditorProps {
  field: CanvasField
}

export interface TooltipPositionOption {
  label: string
  icon: ComponentType<IconProps>
}
