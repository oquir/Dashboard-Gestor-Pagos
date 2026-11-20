import type {
  CanvasField,
  FieldOption,
  FieldValidationOverride,
  FieldValidationRules,
} from '../../types/field'
import type { PatternRule } from '../../types/fieldContact'
import type { DateBound, DateBoundSide } from '../../types/fieldDate'
import type { RepeatableGroup } from '../../types/formStructure'
import { boundExpression, boundMessage, isCompleteBound } from '../dateBound/dateBound'
import { effectivePattern } from '../fieldContact/fieldContact'
import { includesTime, isDateRangeField } from '../fieldDate/fieldDate'
import { isPresentationalField } from '../fieldKind/fieldKind'
import { effectiveMaxLength } from '../fieldLength/fieldLength'
import {
  exportableOptions,
  isMultiValueField,
  isOptionBasedField,
} from '../fieldOptions/fieldOptions'
import {
  DATE_VALUE_MESSAGE,
  DATE_VALUE_PATTERN,
  DATETIME_VALUE_MESSAGE,
  DATETIME_VALUE_PATTERN,
  RANGE_END_INVALID,
  RANGE_END_MISSING,
  RANGE_ORDER_MESSAGE,
  RANGE_START_INVALID,
  RANGE_START_MISSING,
} from './zodSchema.constants'

// El schema como texto: el consumidor lo ejecuta con new Function. No sabe de visibleWhen: sacar un
// campo oculto del resolver es cosa del consumidor.

export function buildGroupZodSchema(group: RepeatableGroup, fields: CanvasField[]): string {
  const shape: string = fields
    .filter((field) => !isPresentationalField(field.type))
    .map((field) => `${JSON.stringify(field.name)}: ${buildZodSchema(field)}`)
    .join(', ')

  return `z.array(z.object({ ${shape} })).min(${group.min}).max(${group.max})`
}

export function buildZodSchema(field: CanvasField): string {
  return buildSchemaFor(field, field.validations)
}

// Las reglas del override se fusionan sobre las de base.
export function buildOverrideZodSchema(
  field: CanvasField,
  override: FieldValidationOverride,
): string {
  return buildSchemaFor(field, mergeValidationRules(field.validations, override.validations))
}

// Las claves undefined no se escriben: pattern: undefined es no tocar, no borrar.
function mergeValidationRules(
  base: FieldValidationRules,
  patch: FieldValidationRules,
): FieldValidationRules {
  const merged: FieldValidationRules = { ...base }

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) (merged as Record<string, unknown>)[key] = value
  }

  return merged
}

function dateSchema(pattern: string, invalidMessage: string, missingMessage?: string): string {
  const missing: string =
    missingMessage === undefined ? '' : `.min(1, { message: ${JSON.stringify(missingMessage)} })`

  return `z.string()${missing}.regex(new RegExp(${JSON.stringify(pattern)}), { message: ${JSON.stringify(invalidMessage)} })`
}

// Compara solo la fecha: con hora el limite es por dia.
function boundRefine(
  accessor: string,
  bound: DateBound | undefined,
  side: DateBoundSide,
  subject: string,
): string {
  if (!isCompleteBound(bound)) return ''

  const operator: string = side === 'min' ? '>=' : '<='
  const message: string = JSON.stringify(boundMessage(bound, side, subject))

  return `.refine((v) => ${accessor}.slice(0, 10) ${operator} ${boundExpression(bound)}, { message: ${message} })`
}

// Dentro del rango las dos puntas son obligatorias (vacio pasa por .optional(), a medias no). Se
// compara como texto. Cada limite va a la punta que puede romperlo.
function dateRangeSchema(pattern: string, v: FieldValidationRules): string {
  const start: string = dateSchema(pattern, RANGE_START_INVALID, RANGE_START_MISSING)
  const end: string = dateSchema(pattern, RANGE_END_INVALID, RANGE_END_MISSING)
  const bounds: string =
    boundRefine('v.desde', v.minDate, 'min', 'La fecha inicial') +
    boundRefine('v.hasta', v.maxDate, 'max', 'La fecha final')

  return `z.object({ desde: ${start}, hasta: ${end} }).refine((r) => r.desde <= r.hasta, { message: ${JSON.stringify(RANGE_ORDER_MESSAGE)} })${bounds}`
}

function dateFieldSchema(field: CanvasField, v: FieldValidationRules): string {
  const withTime: boolean = includesTime(field)
  const pattern: string = withTime ? DATETIME_VALUE_PATTERN : DATE_VALUE_PATTERN

  if (isDateRangeField(field)) return dateRangeSchema(pattern, v)

  const base: string = dateSchema(pattern, withTime ? DATETIME_VALUE_MESSAGE : DATE_VALUE_MESSAGE)

  return (
    base +
    boundRefine('v', v.minDate, 'min', 'La fecha') +
    boundRefine('v', v.maxDate, 'max', 'La fecha')
  )
}

function buildSchemaFor(field: CanvasField, v: FieldValidationRules): string {
  let schema: string

  if (isOptionBasedField(field.type)) {
    // Solo se enumeran las opciones de un campo fuera del contrato; uno mapeado las recibe del
    // catalogo y cae en z.string().
    const options: FieldOption[] = exportableOptions(field) ?? []
    const ids: string[] = options.map((option) => JSON.stringify(option.id))
    schema = ids.length > 0 ? `z.enum([${ids.join(', ')}])` : 'z.string()'

    if (isMultiValueField(field.type)) {
      return v.required ? `z.array(${schema}).min(1)` : `z.array(${schema}).optional()`
    }

    return v.required ? schema : `${schema}.optional()`
  }

  switch (field.type) {
    case 'number':
    case 'calculated': {
      schema = 'z.number()'
      if (v.min !== undefined) schema += `.min(${v.min})`
      if (v.max !== undefined) schema += `.max(${v.max})`
      // Digitos de la parte entera, como refine: con .max() no se puede decir.
      const digits: number | undefined = effectiveMaxLength(v.maxLength)
      if (digits !== undefined) {
        schema += `.refine((n) => Math.abs(Math.trunc(n)).toString().length <= ${digits}, { message: "Máximo ${digits} dígitos" })`
      }
      break
    }
    case 'checkbox':
      schema = 'z.boolean()'
      break
    case 'date':
      schema = dateFieldSchema(field, v)
      break
    case 'file': {
      const config = field.fileConfig ?? { acceptedFormats: [], maxSizeMB: 10 }
      const maxBytes = Math.floor(config.maxSizeMB * 1024 * 1024)
      schema = 'z.instanceof(File)'
      schema += `.refine((f) => f.size <= ${maxBytes}, { message: "Máximo ${config.maxSizeMB}MB" })`
      if (config.acceptedFormats.length > 0) {
        const acceptedJson = JSON.stringify(config.acceptedFormats)
        schema += `.refine((f) => { const accepted = ${acceptedJson}; return accepted.some((a) => a.startsWith(".") ? f.name.toLowerCase().endsWith(a.toLowerCase()) : a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : f.type === a); }, { message: "Formato no permitido" })`
      }
      break
    }
    default: {
      schema = 'z.string()'
      if (v.minLength !== undefined) schema += `.min(${v.minLength})`
      // effectiveMaxLength, el mismo que aplica el input: si no, discreparian.
      const chars: number | undefined = effectiveMaxLength(v.maxLength)
      if (chars !== undefined) schema += `.max(${chars})`
      // Un telefono o un correo sin patron propio igual sale con el de su tipo: ver lib/fieldContact.
      const format: PatternRule | undefined = effectivePattern(field, v)
      if (format) {
        const source: string = JSON.stringify(format.pattern)
        const message: string = format.message
          ? `, { message: ${JSON.stringify(format.message)} }`
          : ''
        schema += `.regex(new RegExp(${source})${message})`
      }
    }
  }

  // Obligatorio por omision de .optional(); isRequiredBySchema lo lee para el asterisco.
  if (!v.required && field.type !== 'checkbox') {
    schema += '.optional()'
  }

  return schema
}
