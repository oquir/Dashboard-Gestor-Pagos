import type {
  FechasMaximasPresentacion,
  MaxDatesParseResult,
  StoredMaxDates,
} from '../../types/maxDates'
import { generarFechasPorDefecto } from '../maxDates/maxDates'
import { MAX_DATES_KEY } from './maxDatesBank.constants'
import { fechasMaximasSchema, storedMaxDatesSchema } from './maxDatesBank.schema'
import { candidateObjects, primeraReglaPorAnio } from './maxDatesBank.utils'

// Banco de fechas del simulador: no entra al borrador ni al export (ni exportForm ni persistence lo
// nombran).

const VACIO: StoredMaxDates = { source: 'default', custom: null }

export function loadMaxDates(): StoredMaxDates {
  const raw: string | null = localStorage.getItem(MAX_DATES_KEY)
  if (!raw) return VACIO

  try {
    const parsed = storedMaxDatesSchema.safeParse(JSON.parse(raw))

    return parsed.success ? parsed.data : VACIO
  } catch {
    return VACIO
  }
}

export function saveMaxDates(stored: StoredMaxDates): void {
  localStorage.setItem(MAX_DATES_KEY, JSON.stringify(stored))
}

// Una tabla en "default", o cargada pero sin ningun ano, se comporta como si no estuviera.
export function usesCustomMaxDates(stored: StoredMaxDates): boolean {
  return stored.source === 'custom' && stored.custom !== null
}

// La generada sigue al reloj y es de solo lectura: editar saca una copia propia.
export function maxDatesEnUso(
  stored: StoredMaxDates,
  anioActual: number,
): FechasMaximasPresentacion {
  return usesCustomMaxDates(stored) && stored.custom
    ? stored.custom
    : generarFechasPorDefecto(anioActual)
}

// Se pega el objeto entero del endpoint: ya viene con la forma, solo se valida.
export function parseMaxDatesPaste(raw: string): MaxDatesParseResult {
  if (raw.trim() === '') return { fechas: null, error: 'Pegá la respuesta del endpoint.' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { fechas: null, error: 'No es JSON válido.' }
  }

  for (const candidate of candidateObjects(parsed)) {
    const result = fechasMaximasSchema.safeParse(candidate)
    if (!result.success) continue

    const fechas: FechasMaximasPresentacion = {
      ...result.data,
      ica: primeraReglaPorAnio(result.data.ica),
      reteica: primeraReglaPorAnio(result.data.reteica),
      autoretencionIca: primeraReglaPorAnio(result.data.autoretencionIca),
    }

    return { fechas, error: null }
  }

  return {
    fechas: null,
    error: 'El JSON no tiene la forma esperada: municipioId, ica, reteica y autoretencionIca.',
  }
}
