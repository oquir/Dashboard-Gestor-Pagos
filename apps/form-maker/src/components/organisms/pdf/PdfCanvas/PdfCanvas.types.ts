// Un punto de la vista (px desde la esquina del area que hace scroll) que no se mueve al hacer zoom.
export interface ZoomAnchor {
  x: number
  y: number
}

// La celda bajo el puntero, con la tabla a la que pertenece.
export interface CellHit {
  tableId: string
  cellId: string
}

// Un arrastre de la seleccion multiple. `started` es que ya cruzo a otra celda (hasta entonces es
// un clic); `last` es la ultima celda a la que se extendio, para no reescribir la misma seleccion.
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
