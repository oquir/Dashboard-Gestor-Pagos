import type { Inscripcion } from '../../../../types'

export interface TablaInscripcionesProps {
  inscripciones: Inscripcion[]
  /** Cuántas hay sin filtrar, para el pie de la tabla. */
  total: number
}
