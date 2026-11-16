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
  'A dónde va a parar el valor de este campo: a una propiedad del objeto que recibe la API, a la lista de conceptos (lo que el contrato no contempla) o a ninguna parte. Un campo excluido sigue sirviendo para cálculos y condiciones, pero no viaja.'

export const EXCLUDED_HINT: string =
  'Este campo no viaja a la API. Sigue sirviendo para cálculos y condiciones dentro del formulario.'

export const OPTIONS_DISCARD_HINT: string =
  'Si lo cambias a Contrato, las opciones que escribiste se descartan.'

export const PENDING_PATH_HINT: string =
  'Falta elegir en qué ruta del objeto de la API va el valor.'
