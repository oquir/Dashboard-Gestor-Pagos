import type { Barra, FormatoGrafica } from '../../../types'

export interface GraficoBarrasProps {
  titulo: string
  descripcion?: string
  barras: Barra[]
  /** Cantidad de registros o suma en pesos. */
  formato: FormatoGrafica
}
