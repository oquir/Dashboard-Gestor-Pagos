import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  help?: string
  error?: string
  /** Explicación más larga, en un globo junto a la etiqueta. */
  info?: ReactNode
  children: ReactNode
}
