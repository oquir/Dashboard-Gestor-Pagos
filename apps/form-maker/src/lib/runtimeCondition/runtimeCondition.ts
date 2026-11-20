import { toScriptNumber } from '../../constants'
import type { ExportedCondition } from '../../types'
import type { RuntimeValues } from '../../types'
import {
  isEmptyValue,
  isTruthyValue,
  looseEquals,
  toComparableText,
  toConditionList,
} from './runtimeCondition.utils'

// El ejecutor de los 13 operadores, compartido por visibilidad, habilitacion y reglas.

// Sin condicion, true: sin visibleWhen se ve, sin enableWhen se edita.
export function evaluateCondition(
  condition: ExportedCondition | undefined,
  values: RuntimeValues,
): boolean {
  if (!condition) return true

  const observed: unknown = values[condition.field]
  const expected: unknown = condition.value

  switch (condition.operator) {
    case 'isEmpty':
      return isEmptyValue(observed)
    case 'isNotEmpty':
      return !isEmptyValue(observed)
    case 'isTruthy':
      return isTruthyValue(observed)
    case 'isFalsy':
      return !isTruthyValue(observed)
    case 'equals':
      return looseEquals(observed, expected)
    case 'notEquals':
      return !looseEquals(observed, expected)
    case 'greaterThan':
      return toScriptNumber(observed) > toScriptNumber(expected)
    case 'lessThan':
      return toScriptNumber(observed) < toScriptNumber(expected)
    case 'startsWith':
      return toComparableText(observed).startsWith(toComparableText(expected))
    case 'endsWith':
      return toComparableText(observed).endsWith(toComparableText(expected))
    case 'contains':
      return Array.isArray(observed)
        ? observed.map(toComparableText).includes(toComparableText(expected))
        : toComparableText(observed).includes(toComparableText(expected))
    case 'in':
      return toConditionList(expected).includes(toComparableText(observed))
    case 'matches':
      return matchesPattern(observed, expected)
    default:
      return true
  }
}

export function evaluateConditions(
  conditions: ExportedCondition[],
  values: RuntimeValues,
  matchAll: boolean,
): boolean {
  if (conditions.length === 0) return true

  return matchAll
    ? conditions.every((condition) => evaluateCondition(condition, values))
    : conditions.some((condition) => evaluateCondition(condition, values))
}

// Una expresion invalida no coincide: el patron no se valida donde se escribe.
function matchesPattern(observed: unknown, expected: unknown): boolean {
  const source: string = toComparableText(expected)
  if (source === '') return true

  try {
    return new RegExp(source).test(toComparableText(observed))
  } catch {
    return false
  }
}
