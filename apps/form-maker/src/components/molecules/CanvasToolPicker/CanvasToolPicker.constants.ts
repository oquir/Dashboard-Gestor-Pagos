import type { IconComponent } from 'reicon-react'
import { Cursor, Hand, VectorSquare } from 'reicon-react'
import type { CanvasTool } from '../../../types/ui'

// El icono es cosa de la barra y no de la herramienta: CANVAS_TOOLS sigue siendo la lista canonica
// de herramientas, etiquetas y atajos, igual que VIEW_MODE_TABS con los iconos de ViewModeSwitch.
export const TOOL_ICONS: Record<CanvasTool, IconComponent> = {
  move: Cursor,
  select: VectorSquare,
  hand: Hand,
}
