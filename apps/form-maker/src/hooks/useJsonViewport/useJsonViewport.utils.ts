import { JSON_ROW_HEIGHT_PX, JSON_ROW_OVERSCAN } from '../../constants'
import type { JsonRowRange } from '../../types'
import type { ClipBounds } from './useJsonViewport.types'

// Ancestros que recortan la lista: en el lienzo desplaza <main>; en el simulador, la propia caja.
export function clippingAncestors(list: HTMLElement): HTMLElement[] {
  const clips: HTMLElement[] = []

  for (let node = list.parentElement; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).overflowY !== 'visible') clips.push(node)
  }

  return clips
}

// La franja de la ventana donde la lista se ve, en coordenadas de la ventana.
export function clipBounds(clips: HTMLElement[]): ClipBounds {
  let top: number = 0
  let bottom: number = window.innerHeight

  for (const clip of clips) {
    const rect: DOMRect = clip.getBoundingClientRect()
    top = Math.max(top, rect.top)
    bottom = Math.min(bottom, rect.bottom)
  }

  return { top, bottom }
}

// Filas que tocan la franja visible mas un margen: todas miden h-5, es una division.
export function visibleRowRange(
  list: HTMLElement,
  clips: HTMLElement[],
  rowCount: number,
): JsonRowRange {
  const { top, bottom } = clipBounds(clips)
  const listTop: number = list.getBoundingClientRect().top
  const first: number = Math.floor((top - listTop) / JSON_ROW_HEIGHT_PX) - JSON_ROW_OVERSCAN
  const last: number = Math.ceil((bottom - listTop) / JSON_ROW_HEIGHT_PX) + JSON_ROW_OVERSCAN
  const start: number = Math.min(Math.max(first, 0), rowCount)

  return { start, end: Math.min(Math.max(last, start), rowCount) }
}

export function sameRange(a: JsonRowRange, b: JsonRowRange): boolean {
  return a.start === b.start && a.end === b.end
}

// El primero que de verdad desplaza en vertical: en el lienzo la caja crece y desplaza <main>.
function verticalScroller(clips: HTMLElement[]): Element | null {
  const scroller: HTMLElement | undefined = clips.find((clip) => {
    const { overflowY } = getComputedStyle(clip)
    return (overflowY === 'auto' || overflowY === 'scroll') && clip.scrollHeight > clip.clientHeight
  })

  return scroller ?? document.scrollingElement
}

// Al centro, salvo que ya se vea con aire. A mano y no con scrollIntoView: la fila puede no estar
// pintada.
export function scrollRowIntoView(list: HTMLElement, clips: HTMLElement[], index: number): void {
  const { top, bottom } = clipBounds(clips)
  const rowTop: number = list.getBoundingClientRect().top + index * JSON_ROW_HEIGHT_PX
  const margin: number = JSON_ROW_HEIGHT_PX * 2
  if (rowTop >= top + margin && rowTop + JSON_ROW_HEIGHT_PX <= bottom - margin) return

  const scroller: Element | null = verticalScroller(clips)
  if (!scroller) return

  scroller.scrollTop += rowTop + JSON_ROW_HEIGHT_PX / 2 - (top + bottom) / 2
}
