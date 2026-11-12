import type { ReactNode } from 'react'

export interface StatTileProps {
  label: string
  value: string
  detail?: ReactNode
  icon?: ReactNode
  /** En verde, para lo que suma, como el recaudo. */
  isPositive?: boolean
}
