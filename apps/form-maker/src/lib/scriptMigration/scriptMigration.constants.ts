import type { FormulaArity } from './scriptMigration.types'

// IDENT_START sin digitos: un nombre no empieza por numero.
export const DIGIT = /[0-9]/
export const IDENT_START = /[A-Za-z_]/
export const IDENT_PART = /[A-Za-z0-9_]/
export const WHITESPACE = /\s/

export const FORMULA_OPERATORS: string[] = ['+', '-', '*', '/', '(', ')', ',']

// Solo la aridad, para rechazar llamadas mal escritas; nadie las evalua.
export const FORMULA_ARITY: Record<string, FormulaArity> = {
  abs: { minArgs: 1, maxArgs: 1 },
  min: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  max: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  sum: { minArgs: 1, maxArgs: Number.POSITIVE_INFINITY },
  round: { minArgs: 1, maxArgs: 2 },
  floor: { minArgs: 1, maxArgs: 1 },
  ceil: { minArgs: 1, maxArgs: 1 },
  dvNit: { minArgs: 1, maxArgs: 1 },
}

// Para decidir parentesis al imprimir; todos asociativos a izquierda.
export const PRECEDENCE: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

export const UNARY_PRECEDENCE: number = 3

// sumOf(x) era sintaxis especial; en el script la columna llega como array y es sum({x}).
export const AGGREGATE_TO_HELPER: Record<string, string> = { sumOf: 'sum', countOf: 'count' }

// La referencia de una llave del compilador hasta la v6, congelada: la migracion reescribe
// exactamente lo que ese compilador sustituia.
export const LEGACY_REF_PATTERN: RegExp = /\{[ \t]*([A-Za-z_][A-Za-z0-9_]*)[ \t]*\}/y
