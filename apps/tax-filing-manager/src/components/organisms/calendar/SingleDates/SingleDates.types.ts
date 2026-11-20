import type { FormDueDates } from '../../../../types'

export interface SingleDatesProps {
  value: FormDueDates
  onChange: (value: FormDueDates) => void
  editable: boolean
  /** Error de cada periodo, por número de periodo. */
  errors: Record<number, string>
}