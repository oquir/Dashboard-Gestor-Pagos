import type { FormDueDates } from '../../../../types'

export interface DueDatesTableProps {
  title: string
  description: string
  value: FormDueDates
  onChange: (value: FormDueDates) => void
  editable: boolean
  /** Error de cada periodo, por número de periodo. */
  errors: Record<number, string>
  /** Si ya hay declaraciones del año presentadas con otra periodicidad, el aviso que lo dice. */
  frequencyNotice?: string
}
