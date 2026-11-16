import type { ReactNode } from 'react'

export interface SelectableItemProps {
  isActive: boolean
  onClick: () => void
  children: ReactNode
}
