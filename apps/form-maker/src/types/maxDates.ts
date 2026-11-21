// Fechas maximas de presentacion de un municipio, como llegan del API (nombres en espanol: son su
// contrato). Lista plana de entradas periodo/digito en vez de un tipo por combinacion de
// periodicidad y digito. No viaja en el export: solo para el simulador. Ver lib/maxDatesBank.

export type Periodicidad = 'anual' | 'bimestral' | 'trimestral' | 'mensual'

export type TipoDigitoValidacion = 'ninguno' | 'primer_digito' | 'ultimo_digito'

// digito solo si el ano valida por digito. fecha en "YYYY/MM/DD".
export interface FechaLimite {
  periodo: number
  digito?: number
  fecha: string
}

export interface ReglaAnio {
  anio: number
  periodicidad: Periodicidad
  tipoDigito: TipoDigitoValidacion
  // De 1 (anual sin digito) a 120 (mensual por ultimo digito).
  fechas: FechaLimite[]
}

export type DeclaracionKind = 'ica' | 'reteica' | 'autoretencionIca'

export interface FechasMaximasPresentacion {
  municipioId: number | string
  ica: ReglaAnio[]
  reteica: ReglaAnio[]
  autoretencionIca: ReglaAnio[]
}

export type MaxDatesSource = 'default' | 'custom'

// Como StoredCatalog: volver a "default" ignora lo cargado sin borrarlo.
export interface StoredMaxDates {
  source: MaxDatesSource
  custom: FechasMaximasPresentacion | null
}

export interface MaxDatesParseResult {
  fechas: FechasMaximasPresentacion | null
  error: string | null
}
