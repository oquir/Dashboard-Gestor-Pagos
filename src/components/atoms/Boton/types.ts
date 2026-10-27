import type { ComponentProps } from 'react'

export type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

export interface BotonProps extends ComponentProps<'button'> {
  variante?: Variante
}
