import type { FieldOption } from './field'

export interface CatalogDefinition {
  id: string
  label: string
  // No devuelve nada mientras no se elija el campo padre.
  requiresParent?: boolean
}

// Columnas extra del endpoint; no viajan en el export.
export interface CatalogOption extends FieldOption {
  // Lo que reconoce el contribuyente, distinto del id: en actividades id es idDeclaracion y code el
  // CIIU.
  code?: string
  // Por mil. Hoy solo en actividades.
  tarifa?: number
}

// Derivado de CatalogOption: una columna nueva se ofrece sola.
export type CatalogColumn = keyof CatalogOption

export interface CatalogEntry extends CatalogOption {
  // Solo en parametrizados: el valor del padre.
  parentId?: string
}

export type CatalogSource = 'default' | 'custom'

// Volver a "default" ignora lo cargado sin borrarlo.
export interface StoredCatalog {
  source: CatalogSource
  entries: CatalogEntry[]
}

// Fuera del borrador y del export; compartido entre formularios.
export type CatalogBank = Record<string, StoredCatalog>

export interface CatalogParseResult {
  entries: CatalogEntry[]
  error: string | null
}

// Nombres de las columnas en el volcado.
export interface CatalogPasteKeys {
  id: string
  label: string
  parent?: string
  code?: string
  tarifa?: string
}
