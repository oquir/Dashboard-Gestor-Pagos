import { MULTI_VALUE_FIELD_TYPES } from '../../constants'
import type { ExportedField } from '../../types'
import type { RuntimeValues } from '../../types'
import { evaluateCondition } from '../runtimeCondition'

// Suelto por nombre; en un grupo, ademas grupo y repeticion.
export function fieldKey(name: string, groupId?: string, index?: number): string {
  return groupId === undefined || index === undefined ? name : `${groupId}:${index}:${name}`
}

// Prefijada para no pisar las de campo (un campo "check" da "check" a secas).
export function checkKey(groupId: string, checkId: string): string {
  return `check:${groupId}:${checkId}`
}

// Gana la primera variante cuya condicion se cumpla; si ninguna, la de base. Lo mismo que hace el
// consumidor.
export function effectiveSchemaSource(
  field: ExportedField,
  values: RuntimeValues,
): string | undefined {
  for (const variant of field.validations.zodSchemaWhen ?? []) {
    if (evaluateCondition(variant.when, values)) return variant.zodSchema
  }

  return field.validations.zodSchema
}

// Obligatorio por la ausencia de .optional(): required no se exporta.
export function isRequiredBySchema(field: ExportedField, values: RuntimeValues = {}): boolean {
  const source: string | undefined = effectiveSchemaSource(field, values)
  // El checkbox nunca lleva .optional(): sin la excepcion todos serian obligatorios.
  if (!source || field.type === 'checkbox') return false

  return !source.trim().endsWith('.optional()')
}

// Un number espera number y el input entrega string: el consumidor hace esta misma conversion.
export function coerceValue(field: ExportedField, raw: unknown): unknown {
  if (MULTI_VALUE_FIELD_TYPES.includes(field.type)) {
    if (raw === undefined || raw === null) return undefined
    return Array.isArray(raw) ? raw : [raw]
  }

  if (field.type === 'checkbox') return Boolean(raw)

  if (field.type === 'number' || field.type === 'calculated') {
    if (raw === undefined || raw === null || raw === '') return undefined
    if (typeof raw === 'number') return raw
    const parsed: number = Number(raw)
    return Number.isNaN(parsed) ? raw : parsed
  }

  // Vacio a undefined, para que .optional() lo acepte.
  if (raw === '' || raw === null) return undefined

  return raw
}
