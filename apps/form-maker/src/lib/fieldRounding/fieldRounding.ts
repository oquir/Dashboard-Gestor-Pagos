import { NUMERIC_FIELD_TYPES } from '../../constants'
import { ROUNDING_MULTIPLE } from './fieldRounding.constants'
import type { RoundableField } from './fieldRounding.types'

// Redondeo al millar y a N decimales: aritmetica pura (cuando se aplica lo deciden el blur y
// runtimeDerived). Cambian el valor, no la vista: por eso los decimales viven aca y no en
// numberFormat.

export function supportsRounding(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type)
}

// Apagado, o en un tipo que no lo admite, no deja rastro en el JSON.
export function exportableRounding(field: RoundableField): boolean | undefined {
  return field.rounding && supportsRounding(field.type) ? true : undefined
}

// Math.round rompe el empate hacia +infinito (-1500 da -1000): se redondea la magnitud y se
// devuelve el signo.
export function roundToMultiple(value: number, multiple: number): number {
  if (!Number.isFinite(value) || multiple <= 0) return value

  const rounded: number = Math.round(Math.abs(value) / multiple) * multiple

  // El + 0 mata el -0 (Object.is(-0, 0) es falso).
  return (value < 0 ? -rounded : rounded) + 0
}

// Escala, redondea y desescala con magnitud y signo. Se eligio sobre toFixed: toFixed sigue la cola
// binaria (0.35 da 0,3) y esto sigue lo que se imprime. Ninguno es exacto: 1.005 da 1 en ambos.
export function roundToDecimals(value: number, decimals: number): number {
  if (!Number.isFinite(value) || decimals < 0) return value

  const factor: number = 10 ** decimals
  const magnitude: number = Math.abs(value) * factor
  // Arriba del entero seguro ya no hay digitos exactos: se devuelve intacto.
  if (magnitude > Number.MAX_SAFE_INTEGER) return value

  const rounded: number = Math.round(magnitude) / factor

  return (value < 0 ? -rounded : rounded) + 0
}

// La guarda del vacio no es defensiva: sin ella un campo sin tocar recibiria un 0, que pasa el
// required y viaja como declarado.
function toFiniteNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw === 'string' && raw.trim() === '') return null

  const parsed: number = Number(raw)

  return Number.isFinite(parsed) ? parsed : null
}

export function applyRounding(field: RoundableField, raw: unknown): unknown {
  if (!field.rounding || !supportsRounding(field.type)) return raw

  const parsed: number | null = toFiniteNumber(raw)

  return parsed === null ? raw : roundToMultiple(parsed, ROUNDING_MULTIPLE)
}

export function applyDecimals(field: RoundableField, raw: unknown): unknown {
  if (field.decimals === undefined || !supportsRounding(field.type)) return raw

  const parsed: number | null = toFiniteNumber(raw)

  return parsed === null ? raw : roundToDecimals(parsed, field.decimals)
}

export function exportableDecimals(field: RoundableField): number | undefined {
  return field.decimals !== undefined && supportsRounding(field.type) ? field.decimals : undefined
}
