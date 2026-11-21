// UVT (DIAN) y SMMLV (decreto) por ano. Banco propio del simulador, fuera del borrador y del export.
// No es un catalogo: son escalares, no opciones {id, label}. Ver lib/valoresBank.

export interface ValorAnual {
  anio: number
  // En pesos.
  uvt: number
  // En pesos.
  smmlv: number
}

export type ValoresSource = 'default' | 'custom'

// Como StoredCatalog: volver a "default" ignora lo cargado sin borrarlo.
export interface StoredValores {
  source: ValoresSource
  custom: ValorAnual[] | null
}

// Nombres de las columnas en la respuesta del endpoint, como en un catalogo.
export interface ValoresParseKeys {
  anio: string
  uvt: string
  smmlv: string
}

export interface ValoresParseResult {
  valores: ValorAnual[] | null
  error: string | null
}
