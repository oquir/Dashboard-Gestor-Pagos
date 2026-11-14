import { JSON_ROW_HEIGHT_PX, JSON_ROW_OVERSCAN } from '../../constants'
import type { JsonRowRange } from '../../types'
import type { ClipBounds } from './useJsonViewport.types'

// Los ancestros que recortan la lista, del mas cercano al mas lejano. La vista no sabe quien la
// desplaza: en el lienzo es el <main> de AppLayout y la lista crece entera; en el panel del
// simulador es la propia caja de la vista. Se calculan una vez por lista montada.
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

// Las filas que tocan la franja visible, mas un margen. Todas las filas miden lo mismo (h-5), asi
// que es una division y no hace falta medir ninguna.
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

// El primero de los recortes que de verdad desplaza en vertical. La caja de la vista tiene
// overflow-auto pero en el lienzo crece con su contenido, asi que ahi no es ella sino <main>.
function verticalScroller(clips: HTMLElement[]): Element | null {
  const scroller: HTMLElement | undefined = clips.find((clip) => {
    const { overflowY } = getComputedStyle(clip)
    return (overflowY === 'auto' || overflowY === 'scroll') && clip.scrollHeight > clip.clientHeight
  })

  return scroller ?? document.scrollingElement
}

// Lleva la fila al centro de la franja visible, salvo que ya se vea con aire. A mano y no con
// scrollIntoView porque la fila puede no estar pintada todavia: la lista virtual la pinta recien
// cuando el scroll llega.
export function scrollRowIntoView(list: HTMLElement, clips: HTMLElement[], index: number): void {
  const { top, bottom } = clipBounds(clips)
  const rowTop: number = list.getBoundingClientRect().top + index * JSON_ROW_HEIGHT_PX
  const margin: number = JSON_ROW_HEIGHT_PX * 2
  if (rowTop >= top + margin && rowTop + JSON_ROW_HEIGHT_PX <= bottom - margin) return

  const scroller: Element | null = verticalScroller(clips)
  if (!scroller) return

  scroller.scrollTop += rowTop + JSON_ROW_HEIGHT_PX / 2 - (top + bottom) / 2
}
