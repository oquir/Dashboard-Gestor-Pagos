import type { Impuesto, Inscripcion, Periodicidad } from './dominio'

/** Un periodo vencido que el inscrito debía declarar y no declaró, con el vencimiento que le tocaba según su último dígito. */
export interface Omiso {
  inscripcion: Inscripcion
  impuesto: Impuesto
  vigencia: number
  periodo: number
  periodicidad: Periodicidad
  vencimiento: string
}

/** Omisos de lo que se está viendo, con lo que no se pudo revisar. */
export interface ResultadoOmisos {
  omisos: Omiso[]
  /**
   * Agentes de ReteICA sin declaración en algún periodo, en municipios que no exigen la declaración en ceros: pudieron
   * no retener nada, así que no se marcan como omisos.
   */
  sinCeros: number
  /** Años gravables sin calendario: sus periodos no se pudieron revisar. */
  sinCalendario: { municipioId: string; vigencia: number }[]
}
