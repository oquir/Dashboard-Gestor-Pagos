import type { IconComponent } from 'reicon-react'
import type { ComponentProps } from 'react'

export interface FilePickerProps extends Omit<ComponentProps<'input'>, 'type' | 'className'> {
  text: string
  icon?: IconComponent
}
