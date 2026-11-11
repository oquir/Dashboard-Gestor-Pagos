import type { Registration } from '../../../../types'

export interface RegistrationsTableProps {
  registrations: Registration[]
  /** Cuántas hay sin filtrar, para el pie de la tabla. */
  total: number
}
