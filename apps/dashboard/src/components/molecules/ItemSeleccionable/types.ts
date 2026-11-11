import type { ReactNode } from 'react'

export interface ItemSeleccionableProps {
  activo: boolean
  onClick: () => void
  children: ReactNode
}
