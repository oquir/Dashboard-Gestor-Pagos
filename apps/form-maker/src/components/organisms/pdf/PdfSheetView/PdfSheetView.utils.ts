import { PDF_EDGE_GUARD_PX } from '../../../../constants'
import type { SheetOverflow } from './PdfSheetView.types'

// Cuanto se sale el contenido de una hoja, en px de verdad: offsetHeight/offsetWidth no cambian con
// el transform del zoom. Medio pixel de tolerancia: el redondeo de los px de mm no es un desborde.
//
// A lo ancho se mira cada bloque: una tabla cuyas columnas suman mas que el espacio crece hasta la
// suma (table-layout fixed) y su borde derecho cae en lo que la hoja recorta. Se mide contra el
// resguardo de los bordes (PDF_EDGE_GUARD_PX), que es parte del espacio pero no de las tablas.
export function measureSheetOverflow(flow: HTMLElement, boxHeight: number): SheetOverflow {
  const limit: number = flow.clientWidth - PDF_EDGE_GUARD_PX
  let widest: number = 0
  for (const child of Array.from(flow.children) as HTMLElement[]) {
    widest = Math.max(widest, child.offsetLeft + Math.max(child.offsetWidth, child.scrollWidth))
  }

  return {
    bottom: Math.max(0, Math.ceil(flow.offsetHeight - boxHeight - 0.5)),
    right: Math.max(0, Math.ceil(widest - limit - 0.5)),
  }
}
