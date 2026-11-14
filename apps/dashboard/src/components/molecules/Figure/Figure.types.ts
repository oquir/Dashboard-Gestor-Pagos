import type { ReactNode } from 'react'

export interface FigureProps {
  label: string
  children: ReactNode
  /** En verde, para lo que suma, como el recaudo. */
  isPositive?: boolean
  /** Explicación de la cifra, en un globo junto a la etiqueta. */
  info?: ReactNode
}
