import type { ApprovalStatus, CorrectionStatus } from './domain'

/** Botón de un control de opción única: una pestaña de una página o un control de una gráfica. */
export interface SelectOption<T> {
  value: T
  text: string
  /** Cantidad junto al texto, como en las pestañas de un listado. */
  count?: number
}

/** Valor de un filtro de listado; el vacío es el que no filtra. */
export type FilterValue<T extends string> = T | ''

/** Filtro por aprobación previa de los listados de declaraciones; `no_aplica`, las que no la tienen. */
export type ApprovalFilter = FilterValue<ApprovalStatus | 'not_applicable'>

/** Filtro por corrección a la baja de los listados de declaraciones: todas, las directas o las solicitudes en un estado. */
export type CorrectionFilter = FilterValue<'all' | 'direct' | CorrectionStatus>

/** Páginas que piden un rango de fechas antes de mostrar los datos. */
export type DateQueryPage = 'registrations' | 'declarations'

/** Rango de fechas consultado en una página, con el municipio que se estaba viendo (null = todos, solo 1cero1). */
export interface DateQuery {
  from: string
  to: string
  municipalityId: string | null
}
