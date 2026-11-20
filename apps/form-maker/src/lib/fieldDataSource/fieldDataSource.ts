import type { CatalogFill, FieldDataSource } from '../../types'

// Al borrar el padre se pierde el filtro, no el catalogo; igual con un destino de relleno.
export function pruneDataSourceReferencing(
  dataSource: FieldDataSource | undefined,
  fieldId: string,
): FieldDataSource | undefined {
  if (!dataSource) return dataSource

  const fills: CatalogFill[] | undefined = dataSource.fills?.filter(
    (fill) => fill.field !== fieldId,
  )
  const lostParent: boolean = dataSource.dependsOn === fieldId
  const lostFill: boolean = fills !== undefined && fills.length !== dataSource.fills?.length
  if (!lostParent && !lostFill) return dataSource

  return {
    catalog: dataSource.catalog,
    dependsOn: lostParent ? undefined : dataSource.dependsOn,
    fills: fills && fills.length > 0 ? fills : undefined,
  }
}
