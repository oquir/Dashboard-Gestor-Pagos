import type { ReactNode } from 'react'

export interface LabeledRangeSliderProps {
  id: string
  label: ReactNode
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  minLabel?: string
  maxLabel?: string
}
