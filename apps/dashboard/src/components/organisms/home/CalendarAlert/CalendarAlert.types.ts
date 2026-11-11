import type { Municipality } from '../../../../types'

export interface CalendarAlertProps {
  /** El año en curso. */
  year: number
  /** Los municipios que se están viendo y no han cargado el calendario de ese año. */
  municipalities: Municipality[]
  className?: string
}
