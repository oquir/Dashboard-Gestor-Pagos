import type { Impuesto } from '../types'

/** Estilo común de los controles de formulario: Input, Select y Textarea. */
export const CLASE_CAMPO =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-500'

/** Color de cada impuesto en las gráficas: las series del recaudo y las barras de los reportes. */
export const CLASE_SERIE: Record<Impuesto, string> = { ica: 'bg-serie-ica', reteica: 'bg-serie-reteica', autorretencion: 'bg-serie-autorretencion' }
