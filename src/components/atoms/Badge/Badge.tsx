import { CLASES_TONO } from './constants'
import type { BadgeProps } from './types'

export default function Badge({ tono = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CLASES_TONO[tono]}`}>
      {children}
    </span>
  )
}
