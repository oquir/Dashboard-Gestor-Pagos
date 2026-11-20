import { NUMERIC_FIELD_TYPES } from '../../constants'
import {
  DECIMAL_SEPARATOR,
  GROUP_SEPARATOR,
  MAX_DISPLAY_DECIMALS,
  MAX_FORMATTABLE,
} from './numberFormat.constants'
import type { FormattableField } from './numberFormat.types'

// Como se ve y como vuelve a entrar un numero. REGLA: el texto formateado no sale del input; el
// estado guarda un numero (parseFloat("1.000") es 1). A mano y no con Intl: tiene que hacer ida y
// vuelta exacta con el parser.

const ALLOWED_TEXT: RegExp = /^-?[\d.]*,?\d*$/

const HAS_DIGIT: RegExp = /\d/

export function supportsFormatting(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type)
}

export function exportableFormatting(field: FormattableField): boolean | undefined {
  return field.formatted && supportsFormatting(field.type) ? true : undefined
}

// Sin decimals, los decimales solo si los hay; con decimals, siempre esos con sus ceros. Rellenar
// no miente; recortar si, y eso vive en applyDecimals.
export function formatNumber(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return ''
  if (Math.abs(value) >= MAX_FORMATTABLE) return String(value)

  // toFixed antes de recortar ceros mata la cola de la coma flotante.
  const fixed: string = Math.abs(value).toFixed(decimals ?? MAX_DISPLAY_DECIMALS)
  const [whole, rest] = fixed.split('.')
  const shown: string = decimals === undefined ? (rest ?? '').replace(/0+$/, '') : (rest ?? '')
  const grouped: string = whole.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR)
  const body: string = shown.length > 0 ? `${grouped}${DECIMAL_SEPARATOR}${shown}` : grouped

  // value < 0 es falso para -0, asi que el cero negativo sale "0" y no "-0".
  return value < 0 ? `-${body}` : body
}

// El punto es siempre miles y la coma siempre decimal: "1.5" a la inglesa da 15, a favor de quien
// declara en Colombia. null si no es numero (el input lo trata como vacio).
export function parseFormattedNumber(text: string): number | null {
  const trimmed: string = text.trim()
  if (trimmed.length === 0) return null

  // Esta funcion decide que es numero: sin la guarda, Number() leeria "1e5".
  if (!ALLOWED_TEXT.test(trimmed) || !HAS_DIGIT.test(trimmed)) return null

  const normalized: string = trimmed.split(GROUP_SEPARATOR).join('').replace(DECIMAL_SEPARATOR, '.')
  const parsed: number = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

// Lista blanca de tecleo (type text perdio el rechazo nativo). allowNegative llega como booleano:
// la politica de signo es de lib/fieldSign.
export function sanitizeNumericInput(raw: string, allowNegative = true, decimals?: number): string {
  const negative: boolean = allowNegative && raw.trimStart().startsWith('-')
  const body: string = raw.replace(/[^\d.,]/g, '')

  // Una sola coma: con dos el texto no parsea.
  const first: number = body.indexOf(DECIMAL_SEPARATOR)
  if (first === -1) return negative ? `-${body}` : body

  const whole: string = body.slice(0, first)
  const rest: string = body
    .slice(first + 1)
    .split(DECIMAL_SEPARATOR)
    .join('')

  // Con decimals 0 se corta EN la coma: "1234,56" da 1234, no 123456.
  const single: string =
    decimals === 0
      ? whole
      : `${whole}${DECIMAL_SEPARATOR}${decimals === undefined ? rest : rest.slice(0, decimals)}`

  return negative ? `-${single}` : single
}

// Recorta la parte entera a max digitos (no caracteres), por la derecha. La regla vive en
// lib/fieldLength.
export function capIntegerDigits(text: string, max: number | undefined): string {
  if (max === undefined || max < 1) return text

  const negative: boolean = text.startsWith('-')
  const body: string = negative ? text.slice(1) : text
  const comma: number = body.indexOf(DECIMAL_SEPARATOR)
  const whole: string = comma === -1 ? body : body.slice(0, comma)

  // Los separadores entran solo si sigue un digito; sin recorte el texto sale tal cual.
  let kept = ''
  let pending = ''
  let digits = 0
  let cut = false

  for (const char of whole) {
    if (!HAS_DIGIT.test(char)) {
      pending += char
      continue
    }
    if (digits === max) {
      cut = true
      break
    }
    kept += pending + char
    pending = ''
    digits += 1
  }

  if (!cut) return text

  const rest: string = comma === -1 ? '' : body.slice(comma)

  return `${negative ? '-' : ''}${kept}${rest}`
}

// Enfocado: sin agrupar pero con coma decimal (mostrar "1.5" y releerlo daria 15).
export function toEditableText(value: unknown): string {
  if (value === undefined || value === null || value === '') return ''

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value).replace('.', DECIMAL_SEPARATOR) : ''
  }

  return String(value)
}

// Sin formatted tambien usa coma decimal: el parser es el mismo.
export function formatForDisplay(field: FormattableField, value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  if (!field.formatted || !supportsFormatting(field.type)) return toEditableText(value)

  const parsed: number | null =
    typeof value === 'number' ? value : parseFormattedNumber(String(value))

  return parsed === null ? String(value) : formatNumber(parsed, field.decimals)
}
