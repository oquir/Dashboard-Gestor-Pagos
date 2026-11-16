import type { Tax } from './domain'

/** Una categoría de la gráfica de barras y lo que aporta al total. */
export interface Bar {
  label: string
  value: number
  /** Color de la barra; por defecto, el de la marca. */
  classes?: string
}

/** Cantidad de registros o suma en pesos. */
export type ChartFormat = 'quantity' | 'pesos'

/** Un periodo de la gráfica de recaudo, con lo recaudado por impuesto. */
export interface CollectionRow {
  label: string
  values: Record<Tax, number>
}
