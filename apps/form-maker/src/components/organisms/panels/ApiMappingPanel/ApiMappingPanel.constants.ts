export {
  HINT_CLASSES,
  WARNING_BANNER_CLASSES as WARNING_CLASSES,
} from '../../../../constants/uiClasses'

// Informativo, no un problema: el campo esta dentro de un grupo repetible y conviene decirlo.
export const NOTE_CLASSES: string =
  'rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300'

export const ERROR_CLASSES: string =
  'rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400'

export const DESTINATION_DESCRIPTION: string =
  'Si el valor de este campo viaja en el objeto que recibe la API y, si viaja, en qué propiedad. Uno que no se envía sigue sirviendo para cálculos y condiciones.'

// Dos opciones con nombre en vez de un interruptor "Excluir": prendido queria decir que NO se
// enviaba, y eso se leia al reves.
export const DESTINATION_CHOICES: { sends: boolean; label: string }[] = [
  { sends: true, label: 'Se envía' },
  { sends: false, label: 'No se envía' },
]

export const EXCLUDED_HINT: string =
  'Este campo no viaja a la API. Sigue sirviendo para cálculos y condiciones dentro del formulario.'

export const OPTIONS_DISCARD_HINT: string =
  'Si lo cambias a Se envía, las opciones que escribiste se descartan.'

export const PENDING_PATH_HINT: string =
  'Falta elegir en qué ruta del objeto de la API va el valor.'

// El mismo control segmentado de Telefono y de Fecha, a dos columnas.
export const DESTINATION_TRACK_CLASSES: string =
  'grid grid-cols-2 gap-0.5 rounded-md border border-border bg-field p-[3px]'

export const DESTINATION_ITEM_BASE_CLASSES: string =
  'rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer'

export const DESTINATION_ITEM_ACTIVE_CLASSES: string = 'bg-brand text-on-brand shadow-sm'

export const DESTINATION_ITEM_INACTIVE_CLASSES: string =
  'text-fg-muted hover:bg-surface-raised hover:text-fg-strong dark:hover:bg-surface-inset'
