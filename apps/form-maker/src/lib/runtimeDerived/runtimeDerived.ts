import type { ExportedField, ExportedRule } from '../../types'
import type { RuntimeContext, RuntimeIssue, RuntimeModel, RuntimeValues } from '../../types'
import type { ScriptRunResult } from '../../types'
import { applyDecimals, applyRounding } from '../fieldRounding'
import { clampNegative } from '../fieldSign'
import { evaluateConditions } from '../runtimeCondition'
import { coerceForScript, coerceValues, runFieldScript } from '../scriptRuntime'
import type { DerivedPlan } from './runtimeDerived.types'
import { planDerivedFields } from './runtimeDerived.utils'

export interface DerivedResult {
  values: RuntimeValues
  computed: Record<string, boolean>
  clamped: Record<string, boolean>
  cycle: string[] | null
  issues: RuntimeIssue[]
}

// Calculados de un ambito en orden topologico.

// El script y despues cada regla que aplique, en orden. computed marca lo calculado (solo lectura
// en el simulador).
export function computeDerivedValues(
  fields: ExportedField[],
  base: RuntimeValues,
  model: RuntimeModel,
  index = 0,
  context?: RuntimeContext,
): DerivedResult {
  const plan: DerivedPlan = planDerivedFields(fields)
  const byName: Map<string, ExportedField> = new Map(fields.map((field) => [field.name, field]))
  const values: RuntimeValues = { ...base }
  // La vista coaccionada se actualiza junto con values: el siguiente calculado la lee ya con su
  // tipo.
  const scriptValues: RuntimeValues = coerceValues(values, model)
  const computed: Record<string, boolean> = {}
  const clamped: Record<string, boolean> = {}
  const issues: RuntimeIssue[] = []

  // undefined es no tocar lo escrito: ni se asigna ni cuenta como calculado.
  function apply(run: ScriptRunResult, name: string, current: unknown): [unknown, boolean] {
    if (run.error) {
      issues.push({ kind: 'script', field: name, message: run.error })
      return [current, false]
    }

    return run.value === undefined ? [current, false] : [run.value, true]
  }

  for (const name of plan.order) {
    const field: ExportedField | undefined = byName.get(name)
    if (!field) continue

    // Sin script ni regla que aplique se conserva lo escrito.
    let next: unknown = values[name]
    let touched = false

    if (field.logic.script) {
      const [value, changed] = apply(
        runFieldScript(
          field.logic.script.compiled,
          model.prelude,
          scriptValues,
          scriptValues[name],
          index,
          context,
        ),
        name,
        next,
      )
      next = value
      touched = touched || changed
    }

    for (const rule of field.logic.rules ?? []) {
      if (!ruleMatches(rule, values)) continue

      for (const effect of rule.effects) {
        if (effect.kind === 'constant') {
          next = effect.value
          touched = true
          continue
        }

        const [value, changed] = apply(
          runFieldScript(
            effect.script.compiled,
            model.prelude,
            scriptValues,
            scriptValues[name],
            index,
          ),
          name,
          next,
        )
        next = value
        touched = touched || changed
      }
    }

    // Redondeo antes de publicar: el campo de abajo lo lee en la misma pasada. Solo si algo lo
    // produjo: lo escrito por el usuario lo redondea el blur.
    if (touched) {
      next = applyDecimals(field, applyRounding(field, next))

      // El recorte despues del redondeo y antes de publicar, por lo mismo.
      const clamp = clampNegative(field, next)
      next = clamp.value
      if (clamp.clamped) clamped[name] = true
    }

    values[name] = next
    scriptValues[name] = coerceForScript(next, field.type)
    if (touched) computed[name] = true
  }

  return { values, computed, clamped, cycle: plan.cycle, issues }
}

function ruleMatches(rule: ExportedRule, values: RuntimeValues): boolean {
  return evaluateConditions(rule.when, values, rule.matchAll)
}
