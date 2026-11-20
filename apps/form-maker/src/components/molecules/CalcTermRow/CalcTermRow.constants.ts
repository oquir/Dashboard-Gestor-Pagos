import type { CalcSignChoice } from './CalcTermRow.types'

// Menos tipografico (U+2212): el guion comun se ve corto al lado del +.
export const CALC_SIGN_CHOICES: CalcSignChoice[] = [
  { sign: '+', symbol: '+', label: 'Sumar' },
  { sign: '-', symbol: '−', label: 'Restar' },
]

export const CYCLE_SUFFIX: string = '(ya depende de este campo)'

export const ROW_CLASSES: string =
  'flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-3 transition-colors hover:border-border-strong dark:bg-black/25'

// Signo activo relleno y no en pastilla: cambia el valor calculado y no puede pasar desapercibido.
export const SIGN_TRACK_CLASSES: string =
  'flex shrink-0 gap-0.5 rounded-md border border-border bg-field p-[3px]'

export const SIGN_ITEM_BASE_CLASSES: string =
  'flex h-7 w-7 items-center justify-center rounded text-sm font-semibold transition-colors hover:cursor-pointer'

export const SIGN_ITEM_ACTIVE_CLASSES: string = 'bg-brand-strong text-on-brand-strong shadow-sm'

export const SIGN_ITEM_INACTIVE_CLASSES: string =
  'text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset'

export const SELECT_CLASSES: string =
  'h-9 w-full appearance-none rounded-md border border-border bg-field pr-9 pl-3 text-sm text-fg outline-none transition-colors hover:cursor-pointer hover:border-border-strong focus:border-brand-border'

export const SELECT_CHEVRON_CLASSES: string =
  'pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle'

export const REMOVE_BUTTON_CLASSES: string =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-subtle transition-colors hover:cursor-pointer hover:bg-danger-surface hover:text-danger disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg-subtle'
