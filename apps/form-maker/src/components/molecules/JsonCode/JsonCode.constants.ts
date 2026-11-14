import type { JsonHighlight, JsonTokenKind } from '../../../types'

export const JSON_TOKEN_CLASSES: Record<JsonTokenKind, string> = {
  key: 'text-sky-600 dark:text-sky-400',
  string: 'text-emerald-600 dark:text-emerald-400',
  number: 'text-orange-600 dark:text-orange-400',
  boolean: 'text-amber-600 dark:text-amber-400',
  null: 'text-slate-400 dark:text-neutral-500',
}

export const JSON_MUTED_CLASS: string = 'text-slate-400 dark:text-neutral-500'

// Sin overflow propio: la caja no es contenedor de scroll, asi la barra del buscador queda pegada
// arriba contra quien desplaza de verdad (ver JsonSearchBar). El desborde vive en el hijo de abajo.
export const JSON_CODE_BASE_CLASSES: string =
  'flex min-h-0 flex-col font-mono text-xs text-slate-500 dark:text-neutral-400'

export const JSON_CODE_SCROLLER_CLASSES: string = 'min-h-0 flex-1 overflow-auto'

// h-5 es JSON_ROW_HEIGHT_PX: la lista virtual cuenta con que todas las filas midan eso.
export const JSON_ROW_CLASSES: string = 'flex h-5 w-max min-w-full leading-5'

export const JSON_MATCH_CLASS: string = 'rounded-sm bg-amber-200 text-inherit dark:bg-amber-400/30'

export const JSON_CURRENT_MATCH_CLASS: string =
  'rounded-sm bg-orange-400 text-white dark:bg-orange-500 dark:text-white'

export const NO_ROW_HIGHLIGHTS: JsonHighlight[] = []
