export type SidebarTab =
  | 'fields'
  | 'attributes'
  | 'validations'
  | 'styles'
  | 'logic'
  | 'apiMapping'
  | 'catalogs'
  | 'fechas'

export type RightSidebarTab = 'project' | 'steps'

export type CanvasViewMode = 'canvas' | 'json' | 'payload'

// select y hand dejan el documento inerte: el puntero lo maneja el puerto.
export type CanvasTool = 'move' | 'select' | 'hand'

export interface CanvasToolItem {
  tool: CanvasTool
  label: string
  // Sin modificadores.
  shortcut: string
}
