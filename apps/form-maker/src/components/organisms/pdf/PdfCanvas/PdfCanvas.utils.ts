import { PDF_CANVAS_ATTRIBUTE } from '../../../../constants'
import type { CellHit, PendingZoom } from './PdfCanvas.types'

// Quien hace scroll es el <main> del disenador, el padre del host.
export function scrollerOf(shadowRoot: ShadowRoot | null): HTMLElement | null {
  return (shadowRoot?.host as HTMLElement | undefined)?.parentElement ?? null
}

// La mas interna, si hay tablas anidadas.
export function cellOf(target: EventTarget | null): CellHit | null {
  if (!(target instanceof Element)) return null

  const node: Element | null = target.closest(`[${PDF_CANVAS_ATTRIBUTE.cell}]`)
  const tableId: string | null | undefined = node?.getAttribute(PDF_CANVAS_ATTRIBUTE.table)
  const cellId: string | null | undefined = node?.getAttribute(PDF_CANVAS_ATTRIBUTE.cell)
  return tableId && cellId ? { tableId, cellId } : null
}

export function restoreZoomAnchor(port: HTMLElement, pending: PendingZoom): void {
  port.scrollLeft = (pending.left + pending.anchor.x) * pending.ratio - pending.anchor.x
  port.scrollTop = (pending.top + pending.anchor.y) * pending.ratio - pending.anchor.y
}
