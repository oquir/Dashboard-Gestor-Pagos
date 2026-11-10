import type { Omiso } from '../../../../types'

/** Los omisos marcados para emplazarlos, por su idOmiso. */
export interface SeleccionOmisos {
  seleccion: ReadonlySet<string>
  marcar: (ids: string[], marcado: boolean) => void
}

export interface TablaOmisosProps {
  /** Los que quedan después de los filtros. */
  omisos: Omiso[]
  /** Cuántos hay sin los filtros de texto y año. */
  total: number
  /** Solo para quien puede emplazar: agrega las casillas. */
  seleccion?: SeleccionOmisos
}
