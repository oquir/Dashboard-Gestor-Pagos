import type { Placement } from '@floating-ui/react'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipProps {
  content: ReactNode
  // Un solo elemento enfocable, para que el teclado tambien lo abra.
  children: ReactElement<Record<string, unknown>>
  placement?: Placement
  className?: string
  disabled?: boolean
}
