import type { ReactNode } from 'react'

export interface CrashPanelProps {
  title: string
  description: ReactNode
  // Mensaje tecnico del error, plegado.
  message: string
  children: ReactNode
}
