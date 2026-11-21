import type { RightSidebarTabItem } from './RightSidebar.types'

export const TABS: RightSidebarTabItem[] = [
  { id: 'project', label: 'Proyecto' },
  { id: 'steps', label: 'Pasos' },
]

// Subrayado y no pastilla: la pastilla parecia un cuarto boton de la fila de acciones.
export const PANEL_TAB_BASE_CLASSES: string =
  'relative flex items-center gap-1.5 px-2 py-2.5 text-xs transition-colors hover:cursor-pointer'

export const PANEL_TAB_ACTIVE_CLASSES: string =
  "font-semibold text-fg-strong after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5 after:rounded-t-sm after:bg-brand after:content-['']"

export const PANEL_TAB_INACTIVE_CLASSES: string = 'font-medium text-fg-muted hover:text-fg'

// Durante un arrastre la pestana Pasos se impone sola; el punto lo explica.
export const PANEL_TAB_DROP_DOT_CLASSES: string =
  'h-[5px] w-[5px] rounded-full bg-brand ring-[3px] ring-brand/20'

// Solo icono y sin relleno: Subir es el unico primario de la fila.
export const PANEL_COLLAPSE_BUTTON_CLASSES: string =
  'flex h-[26px] w-[26px] items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

// Al pie del bloque Formulario, a todo el ancho y neutro: secundario frente a Subir y Exportar.
export const OPEN_PROJECT_BUTTON_CLASSES: string =
  'press mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-fg-soft transition-colors hover:border-border-strong hover:text-fg-strong hover:cursor-pointer'
