import type { ComponentProps } from 'react'

export type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}
