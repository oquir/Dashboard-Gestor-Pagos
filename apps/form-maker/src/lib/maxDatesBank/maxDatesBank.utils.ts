import type { ReglaAnio } from '../../types/maxDates'

// Una regla por ano y declaracion; si el endpoint repite un ano, queda la primera.
export function primeraReglaPorAnio(reglas: ReglaAnio[]): ReglaAnio[] {
  const anios = new Set<number>()

  return reglas.filter((regla) => {
    if (anios.has(regla.anio)) return false

    anios.add(regla.anio)
    return true
  })
}

// Prueba el objeto y cada propiedad objeto ({success, result} o {data}): es lo que uno pega.
export function candidateObjects(parsed: unknown): unknown[] {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []

  const candidates: unknown[] = [parsed]

  for (const value of Object.values(parsed)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) candidates.push(value)
  }

  return candidates
}
