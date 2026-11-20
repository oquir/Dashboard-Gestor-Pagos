import type { CatalogOption } from '../../types'

// Sin tildes y en minusculas: el catalogo viene acentuado y en mayusculas. NFD separa la tilde y
// \p{M} se la lleva.
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

// Se busca sobre el codigo y la descripcion juntos, que es lo que la fila muestra.
export function filterOptions(options: CatalogOption[], query: string): CatalogOption[] {
  const needle: string = normalize(query.trim())
  if (needle === '') return options

  return options.filter((option) =>
    normalize(`${option.code ?? ''} ${option.label}`).includes(needle),
  )
}

export function findSelected(options: CatalogOption[], value: unknown): CatalogOption | null {
  if (value === undefined || value === null || value === '') return null

  const id: string = String(value)

  return options.find((option) => option.id === id) ?? null
}
