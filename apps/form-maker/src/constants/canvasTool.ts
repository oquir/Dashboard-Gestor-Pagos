import type { CanvasToolItem } from '../types'

// Lista canonica: el atajo sale de aca para el teclado y para el title, asi no pueden diferir.
export const CANVAS_TOOLS: CanvasToolItem[] = [
  { tool: 'move', label: 'Mover', shortcut: 'V' },
  { tool: 'select', label: 'Selección múltiple', shortcut: 'M' },
  { tool: 'hand', label: 'Mano', shortcut: 'H' },
]
