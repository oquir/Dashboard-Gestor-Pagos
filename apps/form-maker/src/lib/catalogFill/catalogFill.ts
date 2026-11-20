import type { CatalogColumn, CatalogOption } from '../../types'
import type { ExportedField } from '../../types'
import type { CatalogFill } from '../../types'
import type { RuntimeValues } from '../../types'

// Copia columnas de la opcion elegida a otros campos (codigo CIIU y tarifa de la actividad). Viaja
// en el export: el consumidor hace lo mismo con su endpoint.

export function hasFills(field: ExportedField): boolean {
  return (field.dataSource?.fills?.length ?? 0) > 0
}

// Declarar que llena una columna dice que importa: el buscador distingue "esta actividad no trae
// tarifa" de "el catalogo no tiene tarifas".
export function fillsColumn(field: ExportedField, column: CatalogColumn): boolean {
  return (field.dataSource?.fills ?? []).some((fill) => fill.column === column)
}

// Valores por nombre de campo; quien llama los mezcla en su ambito (la fila del grupo, no el root).
export function resolveFills(
  field: ExportedField,
  selected: unknown,
  options: CatalogOption[],
): RuntimeValues {
  const fills: CatalogFill[] | undefined = field.dataSource?.fills
  if (!fills || fills.length === 0) return {}

  const empty: boolean = selected === undefined || selected === null || selected === ''
  const option: CatalogOption | undefined = empty
    ? undefined
    : options.find((candidate) => candidate.id === String(selected))

  const values: RuntimeValues = {}

  // Sin opcion o sin columna el destino se vacia: dejar la tarifa anterior calcularia mal sin
  // aviso.
  for (const fill of fills) {
    const value: unknown = option?.[fill.column]
    values[fill.field] = value === undefined ? '' : value
  }

  return values
}
