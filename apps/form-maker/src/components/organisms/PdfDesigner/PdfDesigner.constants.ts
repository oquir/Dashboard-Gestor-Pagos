import type { PdfSaveStatus } from './PdfDesigner.types'

export const STATUS_DOT_CLASSES: Record<PdfSaveStatus['tone'], string> = {
  saved: 'bg-success',
  error: 'bg-danger',
  idle: 'bg-fg-subtle',
}

export const ICON_BUTTON_CLASSES: string =
  'flex items-center justify-center rounded-md border border-border p-1.5 text-fg-muted hover:cursor-pointer hover:border-border-strong hover:text-fg'

// Con la mano puesta el puntero es una mano abierta, y cerrada mientras se arrastra. Va en el <main>
// que hace scroll: las hojas, adentro del shadow root, quedan inertes y heredan el cursor.
export const HAND_CURSOR_CLASSES: string = 'cursor-grab select-none active:cursor-grabbing'

export const PUBLISH_BUTTON_CLASSES: string =
  'flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-on-brand transition-colors hover:bg-brand-hover hover:cursor-pointer'

export const EXIT_BUTTON_CLASSES: string =
  'flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg-soft hover:cursor-pointer hover:border-border-strong'
