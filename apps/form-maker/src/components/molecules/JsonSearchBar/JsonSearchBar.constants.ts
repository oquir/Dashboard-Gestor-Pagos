// Del ancho de la caja del JSON y pegada arriba mientras se baja: en el lienzo quien desplaza es
// <main>, y la caja de la vista no es contenedor de scroll, asi que sticky se ancla a <main>. No
// scrollea de costado con el JSON porque vive fuera de la lista.
//
// @container y no breakpoints de pantalla: la misma barra va en la vista JSON (ancha) y en el panel
// del simulador (angosto en una pantalla ancha). Lo que importa es el ancho de la caja.
export const SEARCH_BAR_CLASSES: string =
  '@container sticky top-2 z-10 mb-2 flex w-full shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-sans shadow-sm'

export const SEARCH_ICON_CLASSES: string = 'hidden shrink-0 text-fg-subtle @xs:block'

// min-w-0 deja que el input sea lo que se encoge cuando falta lugar, no los botones.
export const SEARCH_INPUT_CLASSES: string =
  'min-w-0 flex-1 bg-transparent py-0.5 text-xs text-fg-strong outline-none placeholder:text-fg-subtle'

export const SEARCH_COUNT_CLASSES: string =
  'shrink-0 whitespace-nowrap px-1 text-right text-[11px] tabular-nums text-fg-subtle'

export const SEARCH_BUTTON_CLASSES: string =
  'flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-muted hover:cursor-pointer hover:bg-surface-raised disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent'
