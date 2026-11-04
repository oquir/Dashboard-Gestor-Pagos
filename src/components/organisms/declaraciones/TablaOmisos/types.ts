import type { Omiso } from '../../../../types'

export interface TablaOmisosProps {
  /** Los que quedan después de los filtros. */
  omisos: Omiso[]
  /** Cuántos hay sin los filtros de texto y año. */
  total: number
}
