import type { RitData, Rate } from '../../../../types'

/** Un dato de la ficha: su etiqueta y su valor, si lo tiene. */
export type CardField = [etiqueta: string, valor: string | undefined]

export interface RitCardProps {
  data: RitData
  previous?: RitData
  rates?: Rate[]
}
