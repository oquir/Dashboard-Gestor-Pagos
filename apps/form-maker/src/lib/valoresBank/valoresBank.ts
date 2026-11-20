import { VALORES_POR_DEFECTO } from '../../constants/valoresAnuales'
import type {
  StoredValores,
  ValorAnual,
  ValoresParseKeys,
  ValoresParseResult,
} from '../../types/valores'
import { VALORES_KEY } from './valoresBank.constants'
import { storedValoresSchema, valorAnualSchema } from './valoresBank.schema'
import { findArray, leerNumero } from './valoresBank.utils'

// Banco de UVT y SMMLV del simulador: no entra al borrador ni al export (ni exportForm ni
// persistence lo nombran).

const VACIO: StoredValores = { source: 'default', custom: null }

export function loadValores(): StoredValores {
  const raw: string | null = localStorage.getItem(VALORES_KEY)
  if (!raw) return VACIO

  try {
    const parsed = storedValoresSchema.safeParse(JSON.parse(raw))

    return parsed.success ? parsed.data : VACIO
  } catch {
    return VACIO
  }
}

export function saveValores(stored: StoredValores): void {
  localStorage.setItem(VALORES_KEY, JSON.stringify(stored))
}

// Una tabla en "default", o cargada pero sin ninguna fila, se comporta como si no estuviera.
export function usesCustomValores(stored: StoredValores): boolean {
  return stored.source === 'custom' && stored.custom !== null && stored.custom.length > 0
}

// Gana entera o no gana: mezclar filas cargadas y de fabrica dejaria una tabla ambigua.
export function valoresEnUso(stored: StoredValores): ValorAnual[] {
  return usesCustomValores(stored) && stored.custom ? stored.custom : VALORES_POR_DEFECTO
}

// Se nombran las columnas, como en un catalogo. Una fila incompleta se descarta (daria un 0 con
// cara de dato); con un ano repetido, gana el primero.
export function parseValoresPaste(raw: string, keys: ValoresParseKeys): ValoresParseResult {
  if (raw.trim() === '') return { valores: null, error: 'Pegá la respuesta del endpoint.' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { valores: null, error: 'No es JSON válido.' }
  }

  const items: unknown[] | null = findArray(parsed)
  if (!items) return { valores: null, error: 'No se encontró ninguna lista dentro del JSON.' }

  const valores: ValorAnual[] = []
  const anios = new Set<number>()

  for (const item of items) {
    const fila = {
      anio: leerNumero(item, keys.anio),
      uvt: leerNumero(item, keys.uvt),
      smmlv: leerNumero(item, keys.smmlv),
    }

    const result = valorAnualSchema.safeParse(fila)
    if (!result.success || anios.has(result.data.anio)) continue

    anios.add(result.data.anio)
    valores.push(result.data)
  }

  if (valores.length === 0) {
    return {
      valores: null,
      error: `Ninguna fila trajo ${keys.anio}, ${keys.uvt} y ${keys.smmlv} con valores numéricos.`,
    }
  }

  // Del mas nuevo al mas viejo, que es el orden en que se miran y el que usa la tabla de fabrica.
  valores.sort((a, b) => b.anio - a.anio)

  return { valores, error: null }
}
