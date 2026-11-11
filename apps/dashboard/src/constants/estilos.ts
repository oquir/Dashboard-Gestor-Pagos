import type { Impuesto } from '../types'

/** Estilo común de los controles de formulario: Input, Select y Textarea. */
export const CLASE_CAMPO =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-500'

/** Botón de una fila de tabla que abre su detalle con el código del registro: el N.º de la bitácora o el RIT. */
export const CLASE_BOTON_FILA =
  'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-2.5 text-sm font-medium tabular-nums text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'

/** Color de cada impuesto en las gráficas: las series del recaudo y las barras de los reportes. */
export const CLASE_SERIE: Record<Impuesto, string> = {
  ica: 'bg-serie-ica',
  reteica: 'bg-serie-reteica',
  autorretencion: 'bg-serie-autorretencion',
}
