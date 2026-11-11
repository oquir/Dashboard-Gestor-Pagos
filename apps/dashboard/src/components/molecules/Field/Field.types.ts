import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  help?: string
  error?: string
  children: ReactNode
}
