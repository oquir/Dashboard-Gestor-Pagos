import type { ReactNode } from 'react'
import type { Tone } from '../../../lib'

export interface BadgeProps {
  tone?: Tone
  children: ReactNode
}
