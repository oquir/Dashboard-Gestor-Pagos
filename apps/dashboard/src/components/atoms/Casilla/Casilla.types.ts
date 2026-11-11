import type { ComponentProps } from 'react'

export interface CasillaProps extends Omit<ComponentProps<'input'>, 'type'> {
  pequena?: boolean
}
