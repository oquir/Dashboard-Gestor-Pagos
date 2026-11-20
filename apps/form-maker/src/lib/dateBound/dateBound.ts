import type { DateBound, DateBoundSide, DateBoundUnit } from '../../types/fieldDate'
import { FIXED_DATE_PATTERN, UNIT_NAMES } from './dateBound.constants'

// Limites de un campo fecha como codigo dentro del schema Zod: un limite relativo se evalua cada
// vez que corre el schema, no al exportar. Lee el reloj de quien llena el formulario (no
// context.hoy).

// Un limite a medio escribir no viaja.
export function isCompleteBound(bound: DateBound | undefined): bound is DateBound {
  if (!bound) return false
  if (bound.kind === 'fixed') return FIXED_DATE_PATTERN.test(bound.date)
  if (bound.kind === 'relative') return Number.isInteger(bound.amount) && bound.amount > 0

  return true
}

// Hora local y no UTC: con UTC, en Colombia "hoy" seria manana desde las 7 de la noche.
const TODAY_TEXT: string =
  '[String(d.getFullYear()).padStart(4, "0"), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-")'

// Al mover meses pasa por el dia 1: el 31 de marzo menos un mes seria el 3 de marzo.
function shiftCode(unit: DateBoundUnit, offset: number): string {
  if (unit === 'days') return `d.setDate(d.getDate() + ${offset}); `

  const months: number = unit === 'years' ? offset * 12 : offset

  return `const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + ${months}); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); `
}

// La expresion JavaScript que da el limite como AAAA-MM-DD.
export function boundExpression(bound: DateBound): string {
  if (bound.kind === 'fixed') return JSON.stringify(bound.date)

  const shift: string =
    bound.kind === 'relative'
      ? shiftCode(bound.unit, bound.direction === 'past' ? -bound.amount : bound.amount)
      : ''

  return `((d) => { ${shift}return ${TODAY_TEXT}; })(new Date())`
}

function formatFixedDate(date: string): string {
  const [year, month, day] = date.split('-')

  return `${day}/${month}/${year}`
}

function span(amount: number, unit: DateBoundUnit): string {
  const [singular, plural] = UNIT_NAMES[unit]

  return `${amount} ${amount === 1 ? singular : plural}`
}

// El mensaje dice la regla, no la fecha: el schema es texto fijo y la fecha cambia cada dia.
export function boundMessage(bound: DateBound, side: DateBoundSide, subject: string): string {
  switch (bound.kind) {
    case 'today':
      return `${subject} no puede ser ${side === 'min' ? 'anterior' : 'posterior'} a hoy`
    case 'fixed':
      return `${subject} no puede ser ${side === 'min' ? 'anterior' : 'posterior'} al ${formatFixedDate(bound.date)}`
    case 'relative': {
      const tense: string = bound.direction === 'past' ? 'en el pasado' : 'en el futuro'
      // Hacia atras el minimo es el tope lejano y el maximo el cercano; hacia adelante, al reves.
      const isFarLimit: boolean = (bound.direction === 'past') === (side === 'min')

      return isFarLimit
        ? `${subject} no puede estar a más de ${span(bound.amount, bound.unit)} ${tense}`
        : `${subject} tiene que estar al menos ${span(bound.amount, bound.unit)} ${tense}`
    }
  }
}
