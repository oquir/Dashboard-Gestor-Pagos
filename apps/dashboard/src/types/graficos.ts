import type { Impuesto } from './dominio'

/** Una categoría de la gráfica de barras y lo que aporta al total. */
export interface Barra {
  etiqueta: string
  valor: number
  /** Color de la barra; por defecto, el de la marca. */
  clase?: string
}

/** Cantidad de registros o suma en pesos. */
export type FormatoGrafica = 'cantidad' | 'pesos'

/** Un periodo de la gráfica de recaudo, con lo recaudado por impuesto. */
export interface FilaRecaudo {
  etiqueta: string
  valores: Record<Impuesto, number>
}
