import type { ReactNode } from 'react'

export interface DataItemProps {
  label: string
  children: ReactNode
  /** Explicación del dato, en un globo junto a la etiqueta. */
  info?: ReactNode
}
