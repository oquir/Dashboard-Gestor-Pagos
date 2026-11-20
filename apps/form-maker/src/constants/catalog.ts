import type { CatalogColumn, CatalogDefinition } from '../types'

// Nombres de catalogo del contrato: el consumidor los traduce a su endpoint real.
export const CATALOG_DEPARTAMENTOS: string = 'departamentos'

export const CATALOG_MUNICIPIOS: string = 'municipios'

export const CATALOG_TIPOS_DOCUMENTO: string = 'tipos_documento'

export const CATALOG_TIPOS_PERSONA: string = 'tipos_persona'

export const CATALOG_PERIODOS_ANUALES: string = 'periodos_anuales'

export const CATALOG_TIPOS_DECLARACION: string = 'tipos_declaracion'

export const CATALOG_TIPOS_SANCION: string = 'tipos_sancion'

export const CATALOG_JUEGOS_PERMITIDOS: string = 'juegos_permitidos'

export const CATALOG_ACTIVIDADES: string = 'actividades'

// Lista cerrada: un nombre tecleado a mano rompe al consumidor en silencio. Agregar uno: una linea
// aca y otra en MOCK_CATALOGS.
export const CATALOGS: CatalogDefinition[] = [
  { id: CATALOG_DEPARTAMENTOS, label: 'Departamentos' },
  { id: CATALOG_MUNICIPIOS, label: 'Municipios', requiresParent: true },
  { id: CATALOG_TIPOS_DOCUMENTO, label: 'Tipos de documento' },
  // ListaTipoPersonaNoConvencional: consorcio o patrimonio autonomo, no natural contra juridica.
  // Ningun campo la mapea todavia.
  { id: CATALOG_TIPOS_PERSONA, label: 'Tipos de persona (no convencional)' },
  { id: CATALOG_PERIODOS_ANUALES, label: 'Periodos anuales' },
  { id: CATALOG_TIPOS_DECLARACION, label: 'Tipos de declaración' },
  { id: CATALOG_TIPOS_SANCION, label: 'Tipos de sanción' },
  { id: CATALOG_JUEGOS_PERMITIDOS, label: 'Juegos permitidos' },
  { id: CATALOG_ACTIVIDADES, label: 'Actividades' },
]

export const CATALOG_COLUMNS: { id: CatalogColumn; label: string }[] = [
  { id: 'code', label: 'Código' },
  { id: 'tarifa', label: 'Tarifa' },
  { id: 'label', label: 'Etiqueta' },
  { id: 'id', label: 'Id' },
]

export function findCatalog(id: string): CatalogDefinition | undefined {
  return CATALOGS.find((catalog) => catalog.id === id)
}
