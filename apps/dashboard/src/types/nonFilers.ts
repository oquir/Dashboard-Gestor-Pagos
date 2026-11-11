import type { Tax, Registration, Frequency } from './domain'

/** Un periodo vencido que el inscrito debía declarar y no declaró, con el vencimiento que le tocaba según su último dígito. */
export interface NonFiler {
  registration: Registration
  tax: Tax
  fiscalYear: number
  period: number
  frequency: Frequency
  dueDateItem: string
}

/** Omisos de lo que se está viendo, con lo que no se pudo revisar. */
export interface NonFilersResult {
  nonFilers: NonFiler[]
  /**
   * Agentes de ReteICA sin declaración en algún periodo, en municipios que no exigen la declaración en ceros: pudieron
   * no retener nada, así que no se marcan como omisos.
   */
  withoutZeros: number
  /** Años gravables sin calendario: sus periodos no se pudieron revisar. */
  withoutCalendar: { municipalityId: string; fiscalYear: number }[]
}
