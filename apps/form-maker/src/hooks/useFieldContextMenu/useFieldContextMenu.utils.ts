import {
  MENU_MAX_HEIGHT_RATIO,
  MENU_MIN_HEIGHT_PX,
  MENU_WIDTH_PX,
  VIEWPORT_MARGIN_PX,
} from './useFieldContextMenu.constants'
import type { FieldContextMenuPosition } from './useFieldContextMenu.types'

// Como un menu de Windows: nace con una esquina en el puntero y se voltea si no cabe (correrlo lo
// despegaba del clic).
export function getMenuPosition(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
): FieldContextMenuPosition {
  const opensRight: boolean = x + MENU_WIDTH_PX + VIEWPORT_MARGIN_PX <= viewportWidth
  const anchoredLeft: number = opensRight ? x : x - MENU_WIDTH_PX
  // Si tampoco cabe volteado (ventana angosta, clic cerca del centro) queda pegado al margen.
  const left: number = Math.max(
    VIEWPORT_MARGIN_PX,
    Math.min(anchoredLeft, viewportWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX),
  )

  // Abre hacia abajo mientras quepa el minimo; si no, hacia el lado con mas espacio. Hacia arriba
  // se ancla con bottom.
  const spaceBelow: number = viewportHeight - y - VIEWPORT_MARGIN_PX
  const spaceAbove: number = y - VIEWPORT_MARGIN_PX
  const opensDown: boolean = spaceBelow >= MENU_MIN_HEIGHT_PX || spaceBelow >= spaceAbove
  const heightCap: number = viewportHeight * MENU_MAX_HEIGHT_RATIO

  return {
    left,
    top: opensDown ? y : undefined,
    bottom: opensDown ? undefined : viewportHeight - y,
    width: MENU_WIDTH_PX,
    maxHeight: Math.min(heightCap, opensDown ? spaceBelow : spaceAbove),
  }
}
