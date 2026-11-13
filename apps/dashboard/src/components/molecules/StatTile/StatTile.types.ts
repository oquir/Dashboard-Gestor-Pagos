import type { ReactNode } from 'react'

export interface StatTileProps {
  label: string
  /** Texto o un Amount, que trae el valor exacto en un Tooltip. */
  value: ReactNode
  detail?: ReactNode
  icon?: ReactNode
  /** En verde, para lo que suma, como el recaudo. */
  isPositive?: boolean
}
