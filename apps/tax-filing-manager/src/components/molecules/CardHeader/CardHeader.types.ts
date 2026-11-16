import type { ReactNode } from 'react'

export interface CardHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  /** Explicación del título, en un globo junto a él. */
  info?: ReactNode
}
