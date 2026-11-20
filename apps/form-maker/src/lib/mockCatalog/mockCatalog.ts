import type { CatalogBank, CatalogOption } from '../../types'
import type { ExportedField } from '../../types'
import type { FieldDataSource } from '../../types'
import type { RuntimeValues } from '../../types'
import { catalogEntriesFor, usesCustomCatalog } from '../catalogBank'
import { isOptionBasedField } from '../fieldOptions'
import { MOCK_BY_LEAF, MOCK_CATALOGS, MOCK_OPTION_COUNT } from './mockCatalog.constants'

// Un campo mapeado recibe opciones del consumidor; aca se generan deterministas por la ruta, salvo
// con dataSource.
export function catalogOptions(
  field: ExportedField,
  values: RuntimeValues = {},
  bank: CatalogBank = {},
): CatalogOption[] {
  if (field.options && field.options.length > 0) return field.options

  const source: FieldDataSource | undefined = field.dataSource

  if (source) {
    // Sin el padre elegido no hay consulta que hacer, igual que en el consumidor real.
    if (source.dependsOn !== undefined) {
      const parent: unknown = values[source.dependsOn]
      if (parent === undefined || parent === null || parent === '') return []

      return fromCatalog(source.catalog, bank, String(parent))
    }

    return fromCatalog(source.catalog, bank)
  }

  // Sin dataSource el consumidor infiere el catalogo de la ruta, asi que el simulador hace igual.
  if (field.apiBinding?.kind === 'mapped') {
    const leaf: string = field.apiBinding.path.split('.').pop() ?? field.name

    return MOCK_BY_LEAF[leaf] ?? placeholderOptions(leaf)
  }

  // Sin catalogo ni ruta igual se inventan: un select vacio y obligatorio dejaria el formulario sin
  // salida.
  return placeholderOptions(field.name)
}

// Si el catalogo del banco esta activo se usa entero: mezclarlo con el de mentira daria listas
// incoherentes.
function fromCatalog(catalogId: string, bank: CatalogBank, parentId?: string): CatalogOption[] {
  if (usesCustomCatalog(bank, catalogId)) {
    return catalogEntriesFor(bank, catalogId, parentId).map((entry): CatalogOption => ({
      id: entry.id,
      label: entry.label,
      code: entry.code,
      tarifa: entry.tarifa,
    }))
  }

  const catalog = MOCK_CATALOGS[catalogId]

  return catalog ? catalog(parentId) : placeholderOptions(catalogId)
}

// Un catalogo declarado sin datos de mentira igual tiene que dejar llenar el formulario.
function placeholderOptions(prefix: string): CatalogOption[] {
  return Array.from({ length: MOCK_OPTION_COUNT }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
  }))
}

// Para avisar en pantalla que las opciones son inventadas; las autoradas o del banco no lo son.
export function isSimulatedCatalog(field: ExportedField, bank: CatalogBank = {}): boolean {
  if (!isOptionBasedField(field.type)) return false
  if (field.options && field.options.length > 0) return false
  if (field.dataSource && usesCustomCatalog(bank, field.dataSource.catalog)) return false

  return true
}
