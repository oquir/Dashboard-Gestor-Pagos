import { ENTER_POP_CLASSES } from './animations'
// Clases de Tailwind repetidas en varios archivos: cambiar un token no depende de encontrar cada
// copia.

export const HINT_CLASSES: string = 'text-[11px] text-fg-muted'

export const ERROR_CLASSES: string = 'text-[11px] text-danger'

export const WARNING_CLASSES: string = 'text-[11px] text-warning'

// Con borde y fondo; WARNING_CLASSES es solo texto.
export const WARNING_BANNER_CLASSES: string =
  'rounded border border-warning-border bg-warning-surface px-2 py-1 text-[11px] text-warning'

// Cargado en verde y vacio en gris: el color hace el barrido.
export const BADGE_LOADED_CLASSES: string =
  'rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'

export const BADGE_EMPTY_CLASSES: string =
  'rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-fg-muted'

export const INPUT_CLASSES: string =
  'w-full rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border'

export const TEXTAREA_CLASSES: string = `${INPUT_CLASSES} h-24 resize-y font-mono`

export const SELECT_CLASSES: string =
  'min-w-0 flex-1 rounded-md border border-border bg-field px-2 py-1 text-xs text-fg outline-none focus:border-brand-border'

export const ACTION_CLASSES: string =
  'shrink-0 text-xs font-medium text-brand-strong hover:cursor-pointer hover:underline'

export const COUNT_CLASSES: string =
  'rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-fg-muted'

export const ADD_LINK_CLASSES: string =
  'text-xs font-medium text-brand-strong hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-40'

// Aparece con hover y queda fijo en lo seleccionado o enfocado (teclado y tactil no tienen hover).
// Dos literales porque Tailwind lee el codigo fuente.
export const CHROME_ON_FIELD_CLASSES: string =
  'opacity-0 group-hover/field:opacity-100 group-focus-within/field:opacity-100'

export const CHROME_ON_ROW_CLASSES: string =
  'opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100'

export const CHROME_PINNED_CLASSES: string = 'opacity-100'

// Container query sobre el ancho real del chip: esconde el icono del control de muestra cuando no
// entra ni el texto.
export const NARROW_FIELD_HIDDEN_CLASSES: string = '@max-[5rem]:hidden'

// Simulador en celular: bajo 40rem de tarjeta, un campo por fila. Container query porque en desktop
// comparte la ventana. Los ! le ganan al estilo inline; el consumidor tiene que hacer lo mismo.
export const PREVIEW_FORM_CONTAINER_CLASSES: string = '@container/form'

export const PREVIEW_ROW_STACK_CLASSES: string = '@max-[40rem]/form:grid-cols-1!'

export const PREVIEW_FIELD_STACK_CLASSES: string =
  '@max-[40rem]/form:col-span-full! @max-[40rem]/form:row-auto!'

// Compartidas con RowColumnsMenu y RowStylesMenu.
export const ROW_TOOLBAR_ITEM_CLASSES: string =
  'flex h-5 items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

export const ROW_TOOLBAR_ICON_ITEM_CLASSES: string =
  'flex h-5 w-5 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg-strong hover:cursor-pointer dark:hover:bg-surface-inset'

// Abre hacia la izquierda: la barra esta pegada al borde derecho de la fila.
export const ROW_TOOLBAR_POPOVER_CLASSES: string = `absolute right-0 top-6 z-20 flex w-72 origin-top-right flex-col gap-2 rounded-md border border-border bg-surface p-3 shadow-lg dark:bg-surface-raised ${ENTER_POP_CLASSES}`

// Compartidas con MoveToStepMenu y CollapsedRightSidebar.
export const CANVAS_TOOLBAR_ACTION_CLASSES: string =
  'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-fg-soft transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-soft dark:hover:bg-surface-inset'

export const CANVAS_TOOLBAR_ICON_ACTION_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:cursor-pointer hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg-muted dark:disabled:hover:bg-transparent'

export const CANVAS_TOOLBAR_DIVIDER_CLASSES: string = 'mx-0.5 h-5 w-px bg-border'

// Caja comun de las barras del formulario y del PDF. w-max: con left-1/2 la caja solo dispone de la
// mitad del contenedor y partia las etiquetas.
export const CANVAS_TOOLBAR_BOX_CLASSES: string =
  'flex w-max items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-lg dark:bg-surface-raised'

export const CANVAS_TOOLBAR_CLASSES: string = `absolute bottom-4 left-1/2 z-30 -translate-x-1/2 ${CANVAS_TOOLBAR_BOX_CLASSES}`

export const CANVAS_TOOLBAR_GROUP_CLASSES: string = 'flex items-center gap-0.5'

export const CANVAS_TOOL_BUTTON_BASE_CLASSES: string =
  'flex h-8 w-8 items-center justify-center rounded-lg press hover:cursor-pointer'

// La herramienta activa en naranja: cambia lo que hace un clic y tiene que verse de reojo.
export const CANVAS_TOOL_BUTTON_ACTIVE_CLASSES: string = 'bg-brand text-on-brand'

export const CANVAS_TOOL_BUTTON_INACTIVE_CLASSES: string =
  'text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset'

// Tinte y no relleno: no es una herramienta y no debe leerse como una cuarta.
export const CANVAS_PERFORMANCE_ON_CLASSES: string =
  'bg-brand-surface text-brand-fg hover:bg-brand-surface'

export const CANVAS_SELECTION_COUNT_CLASSES: string =
  'whitespace-nowrap px-2 text-xs font-semibold tabular-nums text-fg-strong'

// Activo en pastilla y no en naranja: el naranja del panel es de Exportar.
export const SWITCH_TRACK_CLASSES: string =
  'flex gap-0.5 rounded-lg border border-border bg-surface-sunken p-[3px]'

export const SWITCH_ITEM_BASE_CLASSES: string =
  'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[11px] transition-colors hover:cursor-pointer'

export const SWITCH_ITEM_ACTIVE_CLASSES: string =
  'bg-surface font-semibold text-fg-strong shadow-sm dark:bg-surface-inset'

export const SWITCH_ITEM_INACTIVE_CLASSES: string = 'font-medium text-fg-muted hover:text-fg-strong'

// Contorno y no relleno: con muchos juntos, el relleno haria una pared de botones.
export const PANEL_BUTTON_CLASSES: string =
  'flex h-7 items-center justify-center gap-1 rounded-md border border-border px-2 text-[11px] font-medium text-fg-soft transition-colors hover:cursor-pointer hover:border-border-strong hover:text-fg-strong disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-soft'

// Un boton de alternar (negrilla, alineacion) cuando esta puesto.
export const PANEL_BUTTON_ON_CLASSES: string =
  'border-brand-border bg-brand-surface text-brand-strong'

export const PANEL_DANGER_LINK_CLASSES: string =
  'text-[11px] font-medium text-danger hover:cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline'
