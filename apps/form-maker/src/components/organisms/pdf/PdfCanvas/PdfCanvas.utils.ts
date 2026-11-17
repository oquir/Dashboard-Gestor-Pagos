import type { PendingZoom } from './PdfCanvas.types'

// Quien hace scroll es el <main> del diseñador, el padre del host del shadow root.
export function scrollerOf(shadowRoot: ShadowRoot | null): HTMLElement | null {
  return (shadowRoot?.host as HTMLElement | undefined)?.parentElement ?? null
}

// El punto del ancla queda donde estaba: lo que habia bajo el cursor (o el centro) sigue ahi.
export function restoreZoomAnchor(port: HTMLElement, pending: PendingZoom): void {
  port.scrollLeft = (pending.left + pending.anchor.x) * pending.ratio - pending.anchor.x
  port.scrollTop = (pending.top + pending.anchor.y) * pending.ratio - pending.anchor.y
}
