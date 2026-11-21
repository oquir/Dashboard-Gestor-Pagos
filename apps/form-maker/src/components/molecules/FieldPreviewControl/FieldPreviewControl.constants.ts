import type { FieldOption } from '../../../types/field'
import type { PhoneKind } from '../../../types/fieldContact'
import type { OptionsNote } from './FieldPreviewControl.types'

export const INPUT_CLASSES: string =
  'flex h-9 min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-border-strong bg-white px-3 text-sm text-fg-subtle dark:bg-neutral-900'

export const READONLY_INPUT_CLASSES: string =
  'flex h-9 min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-border bg-surface-raised px-3 text-sm text-fg-muted dark:bg-neutral-700/40'

export const TEXTAREA_CLASSES: string =
  'relative h-16 min-w-0 overflow-hidden rounded-md border border-border-strong bg-white px-3 py-2 text-sm text-fg-subtle dark:bg-neutral-900'

export const SELECT_CHEVRON_CLASSES: string =
  '-mr-3 flex h-full shrink-0 items-center border-l border-border-strong px-2 text-fg-muted'

export const SPINNER_CLASSES: string = 'flex shrink-0 flex-col text-fg-subtle'

export const AFFIX_CLASSES: string = 'shrink-0 text-fg-muted'

export const SUGGESTION_COUNT_CLASSES: string =
  'flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums text-fg-muted'

// Sin espacios, como exige el patron: el ejemplo tiene que validar.
export const PHONE_SAMPLES: Record<PhoneKind, string> = {
  celular: '3001234567',
  fijo: '6011234567',
  fax: '6011234567 ext 123',
}

export const OPTION_INLINE_CLASSES: string = 'flex flex-wrap items-center gap-x-4 gap-y-1.5'

export const OPTION_LIST_CLASSES: string = 'flex flex-col gap-1.5'

export const OPTION_ROW_CLASSES: string = 'flex min-w-0 items-center gap-2 text-sm text-fg-soft'

export const PLACEHOLDER_OPTION_CLASSES: string = 'truncate text-fg-muted'

export const RADIO_CLASSES: string =
  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-white dark:bg-neutral-900'

export const RADIO_ON_CLASSES: string =
  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] border-brand bg-white dark:bg-neutral-900'

export const CHECKBOX_CLASSES: string =
  'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-border-strong bg-white dark:bg-neutral-900'

export const CHECKBOX_ON_CLASSES: string =
  'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-brand bg-brand text-on-brand'

export const TILE_ROW_CLASSES: string = 'flex flex-wrap items-center gap-2.5'

export const TILE_CLASSES: string =
  'min-w-0 truncate rounded-md border border-border-strong bg-white px-4 py-1.5 text-sm text-fg-subtle dark:bg-neutral-900'

export const TILE_ON_CLASSES: string =
  'min-w-0 truncate rounded-md border border-brand bg-white px-4 py-1.5 text-sm text-brand dark:bg-neutral-900'

export const GHOST_TILE_CLASSES: string =
  'flex min-w-0 items-center gap-1.5 rounded-md border border-dashed border-border-strong px-3 py-2 text-xs text-fg-subtle'

export const GHOST_CHIP_CLASSES: string =
  'flex w-fit min-w-0 max-w-full items-center gap-1 rounded-full border border-dashed border-border-strong px-2 py-0.5 text-[11px] text-fg-subtle'

export const DROPZONE_CLASSES: string =
  'flex min-w-0 flex-col items-center gap-1 overflow-hidden rounded-md border-2 border-dashed border-border-strong bg-surface-sunken px-3 py-3 text-center'

export const GROUP_TITLE_CLASSES: string = 'text-xs font-medium text-fg-muted'

export const PLACEHOLDER_OPTIONS: FieldOption[] = [
  { id: 'placeholder-1', label: 'Opción 1' },
  { id: 'placeholder-2', label: 'Opción 2' },
]

export const SELECT_NOTE_TEXT: Record<OptionsNote, string> = {
  catalog: 'Opciones desde la base de datos',
  empty: 'Sin opciones todavía',
}

export const GHOST_NOTE_TEXT: Record<OptionsNote, string> = {
  catalog: 'De la base de datos',
  empty: 'Sin opciones todavía',
}

export const GHOST_NOTE_TITLE: Record<OptionsNote, string> = {
  catalog:
    'Las opciones se cargan de la base de datos cuando se llena el formulario. Las de acá son de muestra.',
  empty: 'Este campo todavía no tiene opciones. Las de acá son de muestra.',
}
