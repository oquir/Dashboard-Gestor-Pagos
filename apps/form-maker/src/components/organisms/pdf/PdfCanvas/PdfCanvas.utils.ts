import { PDF_CANVAS_ATTRIBUTE } from '../../../../constants'
import type { CellHit, PendingZoom } from './PdfCanvas.types'

// Quien hace scroll es el <main> del diseñador, el padre del host del shadow root.
export function scrollerOf(shadowRoot: ShadowRoot | null): HTMLElement | null {
  return (shadowRoot?.host as HTMLElement | undefined)?.parentElement ?? null
}

// La celda del lienzo que contiene al objetivo del evento (la mas interna, si hay tablas anidadas).
export function cellOf(target: EventTarget | null): CellHit | null {
  if (!(target instanceof Element)) return null

  const node: Element | null = target.closest(`[${PDF_CANVAS_ATTRIBUTE.cell}]`)
  const tableId: string | null | undefined = node?.getAttribute(PDF_CANVAS_ATTRIBUTE.table)
  const cellId: string | null | undefined = node?.getAttribute(PDF_CANVAS_ATTRIBUTE.cell)
  return tableId && cellId ? { tableId, cellId } : null
}

// El punto del ancla queda donde estaba: lo que habia bajo el cursor (o el centro) sigue ahi.
export function restoreZoomAnchor(port: HTMLElement, pending: PendingZoom): void {
  port.scrollLeft = (pending.left + pending.anchor.x) * pending.ratio - pending.anchor.x
  port.scrollTop = (pending.top + pending.anchor.y) * pending.ratio - pending.anchor.y
}
