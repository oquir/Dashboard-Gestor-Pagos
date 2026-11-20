// Sin pointer-events: es solo lectura y no puede robarle clics al lienzo. El ancho deja libre la
// esquina del chip plegado.
export const LABEL_CLASSES: string =
  'pointer-events-none absolute left-4 top-4 z-20 flex max-w-[calc(100%-20rem)] min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs shadow-sm dark:bg-surface-raised'

// Insignia invertida para el modal de entrada: se distingue del formulario de un vistazo.
export const FORM_BADGE_CLASSES: string =
  'shrink-0 rounded-md bg-surface-inset px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fg-soft'

export const INTRO_BADGE_CLASSES: string =
  'shrink-0 rounded-md bg-inverse px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-inverse'

export const NUMBER_CLASSES: string = 'shrink-0 font-medium tabular-nums text-fg-muted'

export const TITLE_CLASSES: string = 'min-w-0 truncate font-semibold text-fg-strong'

export const HIDDEN_CLASSES: string = 'shrink-0 text-fg-muted'
