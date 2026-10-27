import type { IconComponent } from 'reicon-react'
import type { ComponentProps } from 'react'

export interface SelectorArchivoProps extends Omit<ComponentProps<'input'>, 'type' | 'className'> {
  texto: string
  icono?: IconComponent
}
