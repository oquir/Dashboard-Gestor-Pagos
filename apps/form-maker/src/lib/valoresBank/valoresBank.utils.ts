// Gemelo del findArray de catalogBank a proposito: los .utils son privados de su carpeta. Busca el
// primer arreglo ({data} o {result}).
export function findArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed
  if (typeof parsed !== 'object' || parsed === null) return null

  for (const value of Object.values(parsed)) {
    if (Array.isArray(value)) return value
  }

  return null
}

// Numero o texto; null descarta la fila. Lectura directa primero: quitar separadores antes
// convertiria "52374.00" en 5237400.
export function leerNumero(item: unknown, key: string): number | null {
  if (typeof item !== 'object' || item === null) return null

  const value: unknown = (item as Record<string, unknown>)[key]
  if (value === undefined || value === null || value === '') return null

  const directo: number = Number(value)
  if (Number.isFinite(directo)) return directo

  // Las dos convenciones de agrupado; son pesos enteros, sin decimales que proteger.
  const limpio: number = Number(String(value).replace(/[.,\s]/g, ''))

  return Number.isFinite(limpio) ? limpio : null
}
