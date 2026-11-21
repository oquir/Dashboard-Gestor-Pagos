import type { PdfSaveStatus } from './PdfDesigner.types'

export const STATUS_DOT_CLASSES: Record<PdfSaveStatus['tone'], string> = {
  saved: 'bg-success',
  error: 'bg-danger',
  idle: 'bg-fg-subtle',
}

export const ICON_BUTTON_CLASSES: string =
  'flex items-center justify-center rounded-md border border-border p-1.5 text-fg-muted hover:cursor-pointer hover:border-border-strong hover:text-fg'

// Va en el <main> que hace scroll: las hojas del shadow root quedan inertes y heredan el cursor.
export const HAND_CURSOR_CLASSES: string = 'cursor-grab select-none active:cursor-grabbing'

// El unico relleno de la cabecera, como Subir en el panel del formulario.
export const UPLOAD_BUTTON_CLASSES: string =
  'flex items-center gap-1.5 rounded-md bg-brand-strong px-3 py-1.5 text-xs font-medium text-on-brand-strong press hover:bg-brand-strong/90 hover:cursor-pointer disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-brand-strong'

export const EXIT_BUTTON_CLASSES: string =
  'press flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg-soft hover:cursor-pointer hover:border-border-strong'
