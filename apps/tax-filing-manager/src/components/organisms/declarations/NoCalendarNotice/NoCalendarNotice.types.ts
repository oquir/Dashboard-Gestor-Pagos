import type { CalendarUpload, Declaration } from '../../../../types'

export interface NoCalendarNoticeProps {
  d: Declaration
  /** Cuándo cargó el municipio el calendario del año gravable, si ya lo cargó. */
  upload?: CalendarUpload
}
