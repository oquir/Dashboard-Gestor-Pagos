import type { ComponentType } from 'react'
import { HelpCircle, Link, LinkOff } from 'reicon-react'
import type { IconProps } from '../../../types/icon'
import type { FieldDestination } from './CanvasFieldChip.types'

export const STATE_ICON_CLASSES: string = 'flex shrink-0 items-center text-fg-subtle'

export const DELETE_BUTTON_CLASSES: string =
  'absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-fg-subtle shadow-sm transition-colors hover:cursor-pointer hover:border-danger-soft hover:text-danger'

// Abajo a la derecha, en el margen del tirador de ancho. Una franja en el borde se descarto: en ICA
// casi todo se envia y pintaba el lienzo entero.
export const DESTINATION_SYMBOL_CLASSES: string = 'absolute bottom-1.5 right-1.5 flex items-center'

export const DESTINATION_ICONS: Partial<Record<FieldDestination, ComponentType<IconProps>>> = {
  sent: Link,
  internal: LinkOff,
  pending: HelpCircle,
}

// Dos colores por decision del usuario: marca si se envia y gris lo demas (lo distingue la forma).
// Paleta de Tailwind y no tokens, tambien a pedido suyo.
export const DESTINATION_COLOR_CLASSES: Partial<Record<FieldDestination, string>> = {
  sent: 'text-brand dark:text-brand',
  internal: 'text-slate-400 dark:text-neutral-500',
  pending: 'text-slate-400 dark:text-neutral-500',
}

export const DESTINATION_TITLES: Record<Exclude<FieldDestination, 'none'>, string> = {
  sent: 'Se envía a la API',
  internal: 'No se envía a la API: es de uso interno del formulario',
  pending: 'Falta decidir si se envía a la API (pestaña Mapeo API)',
}

export const BORDER_CLASSES: string =
  'border-slate-200 hover:border-slate-300 dark:border-neutral-700 dark:hover:border-neutral-600'

export const INTERNAL_BORDER_CLASSES: string =
  'border-dashed border-slate-300 hover:border-slate-400 dark:border-neutral-600 dark:hover:border-neutral-500'

export const SELECTED_BORDER_CLASSES: string = 'border-brand ring-1 ring-brand'
