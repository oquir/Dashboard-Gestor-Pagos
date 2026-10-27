import type { Municipio } from '../../../../types'

/** Cifras del municipio para su tarjeta. */
export interface ResumenMunicipio {
  activas: number
  declaraciones: number
  recaudo: number
  usuarios: number
}

export interface TarjetaMunicipioProps {
  municipio: Municipio
  resumen: ResumenMunicipio
}
