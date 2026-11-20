// Sticky contra <main> y fuera de la lista, para no desplazarse de costado. @container y no
// breakpoints: va en la vista JSON y en el panel angosto del simulador.
export const SEARCH_BAR_CLASSES: string =
  '@container sticky top-2 z-10 mb-2 flex w-full shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-sans shadow-sm'

export const SEARCH_ICON_CLASSES: string = 'hidden shrink-0 text-fg-subtle @xs:block'

// min-w-0: se encoge el input, no los botones.
export const SEARCH_INPUT_CLASSES: string =
  'min-w-0 flex-1 bg-transparent py-0.5 text-xs text-fg-strong outline-none placeholder:text-fg-subtle'

export const SEARCH_COUNT_CLASSES: string =
  'shrink-0 whitespace-nowrap px-1 text-right text-[11px] tabular-nums text-fg-muted'

export const SEARCH_BUTTON_CLASSES: string =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-muted hover:cursor-pointer hover:bg-surface-raised disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent'
