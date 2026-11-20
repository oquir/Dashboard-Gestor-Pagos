import { DATE_FIELD_TYPE } from '../../constants/fieldTypes'
import type { DateCapableField, DateFormatId, DateRangeValue } from '../../types/fieldDate'
import { datePattern, formatIsoValue } from '../dateFormat/dateFormat'
import { DATE_INPUT_MAX, DATETIME_INPUT_MAX } from './fieldDate.constants'

// Una fecha o un rango, cada uno con o sin hora (ausente: una fecha sin hora). No es presentacion:
// cambia la forma del valor y con ella el schema, las condiciones y el destino.

export function isDateFieldType(type: string): boolean {
  return type === DATE_FIELD_TYPE
}

export function isDateRangeField(field: DateCapableField): boolean {
  return Boolean(field.dateRange) && isDateFieldType(field.type)
}

// La hora la pide el municipio, no todos: por eso es opcional y no la forma normal del campo.
export function includesTime(field: DateCapableField): boolean {
  return Boolean(field.includesTime) && isDateFieldType(field.type)
}

export function exportableDateRange(field: DateCapableField): true | undefined {
  return isDateRangeField(field) ? true : undefined
}

export function exportableIncludesTime(field: DateCapableField): true | undefined {
  return includesTime(field) ? true : undefined
}

// datetime-local: hora de reloj sin huso; en UTC cambiaria el dia de quien declara a las 11 de la
// noche.
export function dateInputType(field: DateCapableField): 'date' | 'datetime-local' {
  return includesTime(field) ? 'datetime-local' : 'date'
}

export function dateInputMax(field: DateCapableField): string {
  return includesTime(field) ? DATETIME_INPUT_MAX : DATE_INPUT_MAX
}

// Ausente: el input del navegador y AAAA-MM-DD hacia la API.
export function dateFormatOf(field: DateCapableField): DateFormatId | undefined {
  return isDateFieldType(field.type) ? field.dateFormat : undefined
}

export function exportableDateFormat(field: DateCapableField): DateFormatId | undefined {
  return dateFormatOf(field)
}

// Cada fecha en el formato del campo; lo incompleto sale tal cual (el schema ya lo frena).
export function formatDateForPayload(field: DateCapableField, value: unknown): unknown {
  const format: DateFormatId | undefined = dateFormatOf(field)
  if (format === undefined) return value

  const withTime: boolean = includesTime(field)
  const pattern: string = datePattern(format, withTime)
  const formatOne = (text: string): string => formatIsoValue(text, pattern, withTime) ?? text

  if (isDateRangeField(field)) {
    if (typeof value !== 'object' || value === null) return value

    const range: DateRangeValue = readDateRange(value)

    return { desde: formatOne(range.desde), hasta: formatOne(range.hasta) }
  }

  return typeof value === 'string' ? formatOne(value) : value
}

// Sin confiar en la forma: un campo recien pasado a rango todavia tiene un texto.
export function readDateRange(value: unknown): DateRangeValue {
  if (typeof value !== 'object' || value === null) return { desde: '', hasta: '' }

  const record = value as Partial<Record<keyof DateRangeValue, unknown>>

  return {
    desde: typeof record.desde === 'string' ? record.desde : '',
    hasta: typeof record.hasta === 'string' ? record.hasta : '',
  }
}

// Dos puntas vacias son sin valor: asi isEmpty se cumple y un rango opcional pasa el schema.
export function toDateRangeValue(range: DateRangeValue): DateRangeValue | undefined {
  return range.desde === '' && range.hasta === '' ? undefined : range
}
