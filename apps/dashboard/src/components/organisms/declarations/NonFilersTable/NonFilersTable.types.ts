import type { NonFiler } from '../../../../types'

/** Los omisos marcados para emplazarlos, por su idOmiso. */
export interface NonFilerSelection {
  selection: ReadonlySet<string>
  mark: (ids: string[], isChecked: boolean) => void
}

export interface NonFilersTableProps {
  /** Los que quedan después de los filtros. */
  nonFilers: NonFiler[]
  /** Cuántos hay sin los filtros de texto y año. */
  total: number
  /** Solo para quien puede emplazar: agrega las casillas. */
  selection?: NonFilerSelection
}
