import { PDF_EDGE_GUARD_PX } from '../../../../constants'
import type { SheetOverflow } from './PdfSheetView.types'

// En px reales (offset no cambia con el zoom), con medio pixel de tolerancia. A lo ancho se mide
// cada bloque contra el resguardo de bordes (PDF_EDGE_GUARD_PX).
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
