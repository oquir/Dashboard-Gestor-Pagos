import type { ExportedField } from '../../types'
import type { DerivedPlan } from './runtimeDerived.types'

// Orden de calculo sobre nombres; gemelo de fieldGraph del lado del builder.

export function isDerivedField(field: ExportedField): boolean {
  const hasScript: boolean = Boolean(field.logic.script)
  const hasRules: boolean = Boolean(field.logic.rules && field.logic.rules.length > 0)

  return hasScript || hasRules
}

// Depende de lo que leen su script, los scripts de sus reglas y sus condiciones; llega resuelto en
// reads.
export function fieldRefs(field: ExportedField): string[] {
  const refs: string[] = [...(field.logic.script?.reads ?? [])]

  for (const rule of field.logic.rules ?? []) {
    for (const condition of rule.when) refs.push(condition.field)

    for (const effect of rule.effects) {
      if (effect.kind === 'script') refs.push(...effect.script.reads)
    }
  }

  return refs
}

export function planDerivedFields(fields: ExportedField[]): DerivedPlan {
  const derived: ExportedField[] = fields.filter(isDerivedField)
  const names: Set<string> = new Set(derived.map((field) => field.name))
  const dependsOn: Map<string, Set<string>> = new Map()
  const dependents: Map<string, string[]> = new Map()

  for (const field of derived) {
    // Solo dependencias hacia otros derivados; una autorreferencia se ignora.
    const own: Set<string> = new Set(
      fieldRefs(field).filter((ref) => names.has(ref) && ref !== field.name),
    )
    dependsOn.set(field.name, own)

    for (const ref of own) {
      dependents.set(ref, [...(dependents.get(ref) ?? []), field.name])
    }
  }

  const pending: string[] = derived
    .map((field) => field.name)
    .filter((name) => (dependsOn.get(name)?.size ?? 0) === 0)
  const order: string[] = []
  const remaining: Map<string, number> = new Map(
    derived.map((field) => [field.name, dependsOn.get(field.name)?.size ?? 0]),
  )

  while (pending.length > 0) {
    const name: string = pending.shift() as string
    order.push(name)

    for (const dependent of dependents.get(name) ?? []) {
      const next: number = (remaining.get(dependent) ?? 0) - 1
      remaining.set(dependent, next)
      if (next === 0) pending.push(dependent)
    }
  }

  // Kahn: lo que nunca llego a cero dependencias pendientes esta en un ciclo.
  const cycle: string[] = derived.map((field) => field.name).filter((name) => !order.includes(name))

  return { order, cycle: cycle.length > 0 ? cycle : null }
}
