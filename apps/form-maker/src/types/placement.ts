export type CanvasTarget =
  { type: 'formStep'; stepId: string } | { type: 'introStep'; stepId: string }

export type PlacementMode = 'move' | 'resize'

export interface FieldPlacement {
  colStart: number
  colSpan: number
}

export interface DragPlacement extends FieldPlacement {
  rowId: string
  mode: PlacementMode
  isValid: boolean
}

export type RowDropEdge = 'before' | 'after'

// Medidas tomadas al empezar el arrastre: el overlay usa el ancho y las vecinas se apartan el alto.
export interface RowDragState {
  rowId: string
  width: number
  height: number
}

// rowId + edge es el borde definitivo, no el que senala el puntero: el indicador no miente.
export interface RowDropTarget {
  rowId: string
  edge: RowDropEdge
  isValid: boolean
}
