import type { CollisionDetection, Modifier } from '@dnd-kit/core'
import { pointerWithin, rectIntersection } from '@dnd-kit/core'
import { getEventCoordinates } from '@dnd-kit/utilities'
import { GRID_GAP_PX } from '../../constants'
import { getRowElement } from '../../lib'
import { getCanvasScale } from '../../lib'
import type {
  CanvasTarget,
  DragPlacement,
  RowDragState,
  RowDropEdge,
  RowDropTarget,
} from '../../types'

// Medidas del arrastre contra el DOM real: la grilla la dibuja CSS.

// Centra la previsualizacion: sin esto, al soltar cerca de un borde cae en otra columna de la que
// se ve.
export const centerOverlayOnCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  if (!activatorEvent || !draggingNodeRect) return transform

  const coordinates = getEventCoordinates(activatorEvent)
  if (!coordinates) return transform

  const rect = overlayNodeRect ?? draggingNodeRect
  const grabOffsetX: number = coordinates.x - draggingNodeRect.left
  const grabOffsetY: number = coordinates.y - draggingNodeRect.top

  return {
    ...transform,
    x: transform.x + grabOffsetX - rect.width / 2,
    y: transform.y + grabOffsetY - rect.height / 2,
  }
}

// Manda el puntero; el solape de rectangulos queda de respaldo porque perdona los huecos entre
// filas. Solo por rects, el overlay de una fila tapaba todas las pestanas y ganaba la mas ancha.
export const pointerFirstCollision: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args)

  return byPointer.length > 0 ? byPointer : rectIntersection(args)
}

export function sameCanvasTarget(a: CanvasTarget | null, b: CanvasTarget | null): boolean {
  if (a === null || b === null) return a === b

  return a.type === b.type && a.stepId === b.stepId
}

// Al empezar: cuando las demas filas se apartan, el alto a dejar libre es el de antes.
export function measureRow(rowId: string): RowDragState | null {
  const element: HTMLElement | null = getRowElement(rowId)
  if (!element) return null

  const rect: DOMRect = element.getBoundingClientRect()
  // En px de maquetacion: buildRowDisplacement lo usa dentro del contenedor escalado.
  const scale: number = getCanvasScale(element)

  return { rowId, width: rect.width / scale, height: rect.height / scale }
}

// Gemelo en Y de getColumnAtPointer: encima o debajo segun el punto medio.
export function getDropEdgeAtPointer(element: HTMLElement, pointerY: number): RowDropEdge {
  const rect: DOMRect = element.getBoundingClientRect()

  return pointerY < rect.top + rect.height / 2 ? 'before' : 'after'
}

// Por valor: se recalcula en cada movimiento y por identidad nunca coincidiria.
export function samePlacement(a: DragPlacement | null, b: DragPlacement | null): boolean {
  if (a === null || b === null) return a === b

  return (
    a.rowId === b.rowId &&
    a.colStart === b.colStart &&
    a.colSpan === b.colSpan &&
    a.mode === b.mode &&
    a.isValid === b.isValid
  )
}

// Por valor y por la misma razon que samePlacement: se recalcula en cada movimiento del puntero.
export function sameRowDropTarget(a: RowDropTarget | null, b: RowDropTarget | null): boolean {
  if (a === null || b === null) return a === b

  return a.rowId === b.rowId && a.edge === b.edge && a.isValid === b.isValid
}

export function getColumnAtPointer(
  rowElement: HTMLElement,
  columns: number,
  pointerX: number,
): number {
  const rect: DOMRect = rowElement.getBoundingClientRect()
  const styles: CSSStyleDeclaration = window.getComputedStyle(rowElement)
  // rect viene escalado y getComputedStyle no: se vuelve a maquetacion antes de mezclarlos.
  const scale: number = getCanvasScale(rowElement)
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0
  const usableWidth = rect.width / scale - paddingLeft - paddingRight
  const perColumn = (usableWidth - (columns - 1) * GRID_GAP_PX) / columns
  if (perColumn <= 0) return 1

  const offsetX = (pointerX - rect.left) / scale - paddingLeft
  const column = Math.floor(offsetX / (perColumn + GRID_GAP_PX)) + 1

  return Math.max(1, Math.min(columns, column))
}
