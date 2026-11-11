import type { ReactNode } from 'react'
import type { Tono } from '../../../lib/tonos'

export interface BadgeProps {
  tono?: Tono
  children: ReactNode
}
