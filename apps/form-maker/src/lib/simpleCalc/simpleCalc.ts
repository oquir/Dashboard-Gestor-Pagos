import type { CanvasField } from '../../types/field'
import type { FieldGraph } from '../../types/fieldGraph'
import type { FormStep } from '../../types/formStructure'
import type {
  CalcTermIndex,
  CalcTermOption,
  CalcTermOptionGroup,
  SimpleCalc,
  SimpleCalcTerm,
} from '../../types/simpleCalc'
import { wouldCreateCycle } from '../fieldGraph/fieldGraph'
import { isNumericField } from '../fieldKind/fieldKind'
import { fieldRefText } from '../fieldScript/fieldScript'
import { findGroupById, findGroupIdForField } from '../repeatableGroup/repeatableGroup'
import {
  ALL_ROWS_CAPTION,
  ALL_WHITESPACE_PATTERN,
  RETURN_ON_SAME_LINE,
  SAME_ROW_CAPTION,
  TRAILING_SEMICOLON_PATTERN,
} from './simpleCalc.constants'
import type { CalcShape } from './simpleCalc.types'
import { readCalcShape } from './simpleCalc.utils'

// Calculo sin codigo: traduce entre campos con signo (mas multiplicador y piso) y logic.script, en
// los dos sentidos. Sin modelo aparte: el script sigue siendo la unica verdad.

// Desde otro grupo la columna llega como array y + la pegaria como texto.
function findEditedGroupId(formSteps: FormStep[], fieldId: string): string | undefined {
  for (const step of formSteps) {
    const groupId: string | undefined = findGroupIdForField(step.rows, fieldId)
    if (groupId !== undefined) return groupId
  }

  return undefined
}

// Numericos del formulario sin el propio; los que dependen de el se marcan (elegirlos cerraria un
// ciclo).
export function buildCalcTermOptions(
  formSteps: FormStep[],
  field: CanvasField,
  graph: FieldGraph,
): CalcTermOptionGroup[] {
  const editedGroupId: string | undefined = findEditedGroupId(formSteps, field.id)
  const groups: CalcTermOptionGroup[] = []

  for (const step of formSteps) {
    const loose: CalcTermOption[] = []
    const byGroup: Map<string, CalcTermOption[]> = new Map()

    for (const row of step.rows) {
      for (const candidate of row.fields) {
        if (candidate.id === field.id || !isNumericField(candidate.type)) continue

        const option: CalcTermOption = {
          fieldId: candidate.id,
          name: candidate.name,
          label: candidate.label.trim() || candidate.name,
          aggregated: row.groupId !== undefined && row.groupId !== editedGroupId,
          createsCycle: wouldCreateCycle(graph, field.id, candidate.id),
        }

        if (row.groupId === undefined) loose.push(option)
        else byGroup.set(row.groupId, [...(byGroup.get(row.groupId) ?? []), option])
      }
    }

    if (loose.length > 0) groups.push({ id: step.stepId, label: step.title, options: loose })

    for (const [groupId, options] of byGroup) {
      const title: string = findGroupById(step, groupId)?.title ?? step.title
      const caption: string = groupId === editedGroupId ? SAME_ROW_CAPTION : ALL_ROWS_CAPTION

      groups.push({
        id: `${step.stepId}:${groupId}`,
        label: `${step.title} · ${title} (${caption})`,
        options,
      })
    }
  }

  return groups
}

export function indexCalcTermOptions(groups: CalcTermOptionGroup[]): CalcTermIndex {
  const byId: Map<string, CalcTermOption> = new Map()
  const byName: Map<string, CalcTermOption> = new Map()

  for (const group of groups) {
    for (const option of group.options) {
      byId.set(option.fieldId, option)
      byName.set(option.name, option)
    }
  }

  return { byId, byName }
}

function termRefText(option: CalcTermOption): string {
  const ref: string = fieldRefText(option.name)

  return option.aggregated ? `sum(${ref})` : ref
}

// Copia el estilo de la plantilla ICA para reabrir sus renglones. null si falta algo.
export function buildSimpleCalcScript(calc: SimpleCalc, index: CalcTermIndex): string | null {
  if (calc.terms.length === 0) return null
  if (calc.multiplier !== null && !Number.isFinite(calc.multiplier)) return null

  const parts: string[] = []

  for (const term of calc.terms) {
    const option: CalcTermOption | undefined = index.byId.get(term.fieldId)
    if (!option) return null

    const ref: string = termRefText(option)

    if (parts.length === 0) parts.push(term.sign === '-' ? `-${ref}` : ref)
    else parts.push(` ${term.sign} ${ref}`)
  }

  let expression: string = parts.join('')

  if (calc.multiplier !== null) {
    const operand: string = calc.terms.length > 1 ? `(${expression})` : expression
    expression = `${operand} * ${String(calc.multiplier)}`
  }

  // El piso va por fuera del multiplicador: lo que no puede bajar de cero es el valor del campo.
  if (calc.floorAtZero) expression = `max(${expression}, 0)`

  return `return ${expression};`
}

// El punto y coma final es opcional en JS y el lector lo acepta, asi que se quita de los dos lados.
function compactScript(text: string): string {
  return text.replace(ALL_WHITESPACE_PATTERN, '').replace(TRAILING_SEMICOLON_PATTERN, '')
}

// Solo si el script es exactamente lo que buildSimpleCalcScript escribiria: se lee con manga ancha,
// se regenera y se compara.
export function parseSimpleCalcScript(script: string, index: CalcTermIndex): SimpleCalc | null {
  const trimmed: string = script.trim()
  if (!RETURN_ON_SAME_LINE.test(trimmed)) return null

  const shape: CalcShape | null = readCalcShape(trimmed)
  if (shape === null) return null

  const terms: SimpleCalcTerm[] = []

  for (const term of shape.terms) {
    const option: CalcTermOption | undefined = index.byName.get(term.name)
    if (!option) return null

    terms.push({ sign: term.sign, fieldId: option.fieldId })
  }

  const calc: SimpleCalc = { terms, floorAtZero: shape.floorAtZero, multiplier: shape.multiplier }
  const regenerated: string | null = buildSimpleCalcScript(calc, index)

  return regenerated !== null && compactScript(regenerated) === compactScript(trimmed) ? calc : null
}
