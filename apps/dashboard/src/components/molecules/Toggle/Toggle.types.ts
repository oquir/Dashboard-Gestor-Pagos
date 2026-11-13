import type { ReactNode } from 'react'

export interface ToggleProps {
  label: string
  help?: string
  /** Explicación más larga, en un globo junto a la etiqueta. */
  info?: ReactNode
  value: boolean
  onChange: (value: boolean) => void
  isDisabled?: boolean
}
