import type { Declaracion, Inscripcion } from '../../../../types'

/** Un cruce: si cumple y qué se revisó. */
export interface Validacion {
  ok: boolean
  texto: string
}

export interface ValidacionesDeclaracionProps {
  d: Declaracion
  ins?: Inscripcion
  /** El municipio tiene el RIT y la validación activa en este formulario. */
  contraRit: boolean
  municipioConRit: boolean
}
