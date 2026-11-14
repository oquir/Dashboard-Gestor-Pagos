import type { ReactNode } from 'react'
import type { DateQuery } from '../../../types'

export interface DateQueryBarProps {
  /** Lo consultado, o null si todavía no se ha consultado. */
  query: DateQuery | null
  consult: (from: string, to: string) => void
  /** Con qué fecha se filtra, por ejemplo "Por la fecha de radicación de la inscripción."; sale en un globo junto al botón. */
  criterion?: string
  /** Un campo más en la fila de las fechas, delante de ellas, como el buscador de municipio de 1cero1. */
  children?: ReactNode
}
