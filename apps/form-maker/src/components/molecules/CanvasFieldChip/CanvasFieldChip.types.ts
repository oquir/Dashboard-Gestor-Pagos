import type { MouseEvent } from 'react'
import type { CanvasField } from '../../../types'

// Adonde va el valor: una ruta de la API, excluido o sin decidir. Los presentacionales no llevan
// marca.
export type FieldDestination = 'sent' | 'internal' | 'pending' | 'none'

export interface CanvasFieldChipProps {
  field: CanvasField
  rowId: string
  rowColumns: number
  rowFields: CanvasField[]
  linkedLabel: CanvasField | null
  selected: boolean
  // Cromo fijo: seleccion unica con la herramienta Mover.
  pinned: boolean
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void
}
