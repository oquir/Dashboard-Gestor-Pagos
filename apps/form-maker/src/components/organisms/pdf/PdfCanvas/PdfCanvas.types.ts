// Punto de la vista que no se mueve al hacer zoom.
export interface ZoomAnchor {
  x: number
  y: number
}

export interface CellHit {
  tableId: string
  cellId: string
}

// started: ya cruzo a otra celda (antes es un clic). last evita reescribir la misma seleccion.
export interface CellDrag extends CellHit {
  started: boolean
  last: string
}

export interface PendingZoom {
  ratio: number
  anchor: ZoomAnchor
  left: number
  top: number
}
