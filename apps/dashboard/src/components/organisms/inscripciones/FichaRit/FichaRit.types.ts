import type { DatosRit, Tarifa } from '../../../../types'

/** Un dato de la ficha: su etiqueta y su valor, si lo tiene. */
export type CampoFicha = [etiqueta: string, valor: string | undefined]

export interface FichaRitProps {
  datos: DatosRit
  anterior?: DatosRit
  tarifas?: Tarifa[]
}
