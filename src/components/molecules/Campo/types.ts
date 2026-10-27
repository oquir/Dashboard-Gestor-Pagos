import type { ReactNode } from 'react'

export interface CampoProps {
  etiqueta: string
  ayuda?: string
  error?: string
  children: ReactNode
}
