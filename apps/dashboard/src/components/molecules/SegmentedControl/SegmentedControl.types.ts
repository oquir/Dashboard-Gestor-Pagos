import type { SelectOption } from '../../../types'

export interface SegmentedControlProps<T extends string | number> {
  label: string
  options: SelectOption<T>[]
  value: T
  change: (value: T) => void
  /** Botones más pequeños, para el encabezado de una tarjeta. */
  compact?: boolean
  className?: string
}
