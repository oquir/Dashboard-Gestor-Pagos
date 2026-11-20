import { NUMERIC_FIELD_TYPES } from '../../constants'
import type { ClampResult, SignedField } from './fieldSign.types'

// Si un numero admite negativos: el filtro impide tipear el signo y al resultado de un script se le
// recorta a 0. Recorta el valor, no la vista.

export function supportsSign(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type)
}

// Polaridad al reves que rounding: ausente significa que SI admite negativos, para que nada recorte
// en silencio. Contrato: solo allowsNegative: false restringe.
export function allowsNegative(field: SignedField): boolean {
  return field.allowsNegative !== false
}

// Solo viaja el false, que es el que restringe. El true es el default y no dice nada.
export function exportableAllowsNegative(field: SignedField): false | undefined {
  return field.allowsNegative === false && supportsSign(field.type) ? false : undefined
}

export function clampNegative(field: SignedField, raw: unknown): ClampResult {
  if (allowsNegative(field) || !supportsSign(field.type)) return { value: raw, clamped: false }
  // El vacio no es cero, misma guarda que en el redondeo.
  if (raw === undefined || raw === null || raw === '') return { value: raw, clamped: false }

  const parsed: number = Number(raw)
  if (!Number.isFinite(parsed) || parsed >= 0) return { value: raw, clamped: false }

  return { value: 0, clamped: true }
}
