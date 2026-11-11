import type { DateQuery } from '../../../types'

export interface DateQueryBarProps {
  /** Lo consultado, o null si todavía no se ha consultado. */
  query: DateQuery | null
  consult: (from: string, to: string) => void
  /** Con qué fecha se filtra, por ejemplo "Por la fecha de radicación de la inscripción." */
  criterion: string
}
