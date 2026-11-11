import type { RegistroBitacora } from '../../../../types'

export interface TablaBitacoraProps {
  registros: RegistroBitacora[]
  /** Cuántos hay sin los filtros, para el pie de la tabla. */
  total: number
}
