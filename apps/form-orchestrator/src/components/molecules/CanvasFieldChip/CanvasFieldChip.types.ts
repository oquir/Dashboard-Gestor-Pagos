import type { MouseEvent } from 'react'
import type { CanvasField } from '../../../types'

// Adonde va el valor del campo: a una ruta de la API, a ningun lado (excluido) o todavia sin
// decidir. Un campo presentacional no tiene valor, asi que no lleva ninguna marca.
export type FieldDestination = 'sent' | 'internal' | 'pending' | 'none'

export interface CanvasFieldChipProps {
  field: CanvasField
  rowId: string
  rowColumns: number
  rowFields: CanvasField[]
  linkedLabel: CanvasField | null
  selected: boolean
  // Cromo fijo sin hover: solo el campo de una seleccion unica con la herramienta de mover.
  pinned: boolean
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void
}
