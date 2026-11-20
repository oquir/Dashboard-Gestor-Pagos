import type { SelectionRect } from '../../types'
import type { ScrollPoint } from './useCanvasMarquee.types'

// De ventana a espacio de scroll; una vez por movimiento, no por campo.
export function scrollOffset(port: HTMLElement): ScrollPoint {
  const portRect: DOMRect = port.getBoundingClientRect()

  return { x: port.scrollLeft - portRect.left, y: port.scrollTop - portRect.top }
}

export function shiftRect(rect: SelectionRect, offset: ScrollPoint): SelectionRect {
  return {
    left: rect.left + offset.x,
    top: rect.top + offset.y,
    right: rect.right + offset.x,
    bottom: rect.bottom + offset.y,
  }
}

// Fixed y fuera del puerto: sin recortarlo pintaria sobre los paneles.
export function clipToPort(port: HTMLElement, rect: SelectionRect): SelectionRect {
  const portRect: DOMRect = port.getBoundingClientRect()

  return {
    left: Math.max(rect.left, portRect.left),
    top: Math.max(rect.top, portRect.top),
    right: Math.min(rect.right, portRect.left + port.clientWidth),
    bottom: Math.min(rect.bottom, portRect.top + port.clientHeight),
  }
}
