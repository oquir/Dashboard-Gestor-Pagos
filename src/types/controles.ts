import type { EstadoAprobacion } from './dominio'

/** Botón de un control de opción única: una pestaña de una página o un control de una gráfica. */
export interface Opcion<T> {
  valor: T
  texto: string
  /** Cantidad junto al texto, como en las pestañas de un listado. */
  conteo?: number
}

/** Valor de un filtro de listado; el vacío es el que no filtra. */
export type ValorFiltro<T extends string> = T | ''

/** Filtro por aprobación previa de los listados de declaraciones; `no_aplica`, las que no la tienen. */
export type FiltroAprobacion = ValorFiltro<EstadoAprobacion | 'no_aplica'>
