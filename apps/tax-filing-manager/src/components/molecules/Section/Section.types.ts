import type { ReactNode } from 'react'

export interface SectionProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}
