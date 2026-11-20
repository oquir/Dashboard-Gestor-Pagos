import { ENTER_POP_CLASSES } from '../../../../constants'
// El trigger del porcentaje, a la medida de la barra flotante (h-8, como sus botones). Los - y + usan
// CANVAS_TOOLBAR_ICON_ACTION_CLASSES, los mismos de Deshacer y Rehacer.
export const ZOOM_TRIGGER_CLASSES: string =
  'flex h-8 min-w-16 items-center justify-center gap-1 rounded-lg px-1.5 text-xs font-medium tabular-nums text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

// La barra esta pegada al borde de abajo: el menu se abre hacia arriba, o se saldria de la ventana.
export const MENU_CLASSES: string = `absolute bottom-10 left-1/2 z-20 flex w-40 origin-bottom -translate-x-1/2 flex-col rounded-md border border-border bg-surface py-1 shadow-lg dark:bg-surface-raised ${ENTER_POP_CLASSES}`

export const ZOOM_ITEM_CLASSES: string =
  'flex items-center justify-between gap-4 px-2.5 py-1.5 text-left text-xs text-fg-soft transition-colors hover:bg-surface-raised hover:cursor-pointer dark:hover:bg-surface-inset'

export const ZOOM_SHORTCUT_CLASSES: string = 'text-[10px] tabular-nums text-fg-muted'
