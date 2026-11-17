import type { ReactNode } from 'react'

export interface CrashPanelProps {
  title: string
  description: ReactNode
  // El mensaje tecnico del error, plegado: le sirve a quien lo vaya a corregir.
  message: string
  // Los botones de salida.
  children: ReactNode
}
