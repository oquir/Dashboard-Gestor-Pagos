// Un punto de la vista (px desde la esquina del area que hace scroll) que no se mueve al hacer zoom.
export interface ZoomAnchor {
  x: number
  y: number
}

export interface PendingZoom {
  ratio: number
  anchor: ZoomAnchor
  left: number
  top: number
}
