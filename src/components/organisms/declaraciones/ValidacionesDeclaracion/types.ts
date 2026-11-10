import type { ConfigMunicipio, Declaracion, Emplazamiento, Inscripcion } from '../../../../types'

/** El emplazamiento ya notificado cuando se presentó la declaración, que decide su sanción, y las tasas del municipio. */
export interface ContextoSancion {
  emplazamiento?: Emplazamiento
  sanciones?: ConfigMunicipio['sanciones']
}

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
  /** En una corrección, la declaración que corrige. */
  corregida?: Declaracion
  sancion?: ContextoSancion
}
