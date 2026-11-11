import type { ComponentProps } from 'react'

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  small?: boolean
}
