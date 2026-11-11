import type { CatalogDefinition, StoredCatalog } from '../../../types'

export interface CatalogCardProps {
  catalog: CatalogDefinition
  stored: StoredCatalog | undefined
}
