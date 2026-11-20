import type { CanvasField } from '../../types/field'
import type { FieldGraph } from '../../types/fieldGraph'
import { collectRuleRefs, ruleScriptSources } from '../fieldRule/fieldRule'
import type { TopologicalResult } from './fieldGraph.types'
import { scriptRefIds } from './fieldGraph.utils'

// Un unico grafo de dependencias entre campos: las relaciones viven en cuatro sitios del modelo y
// un ciclo puede cruzarlos.

export function buildNameToIdIndex(fields: CanvasField[]): Map<string, string> {
  const index: Map<string, string> = new Map()

  for (const field of fields) {
    index.set(field.name, field.id)
  }

  return index
}

// Las cuatro fuentes de aristas, normalizadas a ids; los scripts usan nombres, de ahi byName.
export function fieldDependencies(
  field: CanvasField,
  byName: Map<string, string>,
  knownNames: Set<string>,
): string[] {
  const candidates: string[] = [
    ...(field.visibleWhen ? [field.visibleWhen.fieldId] : []),
    ...(field.enableWhen ? [field.enableWhen.fieldId] : []),
    ...collectRuleRefs(field.logic.rules),
    ...scriptRefIds(field.logic.script, byName, knownNames),
    ...ruleScriptSources(field.logic.rules).flatMap((source) =>
      scriptRefIds(source, byName, knownNames),
    ),
  ]

  const unique: string[] = []
  const seen = new Set<string>()

  for (const id of candidates) {
    if (seen.has(id)) continue
    seen.add(id)
    unique.push(id)
  }

  return unique
}

export function buildFieldGraph(fields: CanvasField[]): FieldGraph {
  const byId: Map<string, CanvasField> = new Map(fields.map((field) => [field.id, field]))
  const byName: Map<string, string> = buildNameToIdIndex(fields)
  // Una vez y no por campo: dentro del bucle seria cuadratico.
  const knownNames: Set<string> = new Set(byName.keys())
  const edges: Map<string, string[]> = new Map()

  for (const field of fields) {
    // Sin referencias a campos borrados: un nodo fantasma impediria cerrar el orden.
    edges.set(
      field.id,
      fieldDependencies(field, byName, knownNames).filter((id) => byId.has(id)),
    )
  }

  return { nodes: fields.map((field) => field.id), edges, byId, byName }
}

export function findCycle(graph: FieldGraph): string[] | null {
  const done = new Set<string>()
  const inPath = new Set<string>()
  const path: string[] = []

  function visit(id: string): string[] | null {
    if (done.has(id)) return null

    if (inPath.has(id)) {
      return [...path.slice(path.indexOf(id)), id]
    }

    inPath.add(id)
    path.push(id)

    for (const dependency of graph.edges.get(id) ?? []) {
      const cycle: string[] | null = visit(dependency)
      if (cycle) return cycle
    }

    path.pop()
    inPath.delete(id)
    done.add(id)

    return null
  }

  for (const id of graph.nodes) {
    const cycle: string[] | null = visit(id)
    if (cycle) return cycle
  }

  return null
}

// Emite lo que ya tiene sus dependencias hasta que una vuelta no emite nada: lo que queda es el
// ciclo. Nunca lanza.
export function topologicalOrder(graph: FieldGraph): TopologicalResult {
  const order: string[] = []
  const emitted = new Set<string>()
  let progressed = true

  while (progressed) {
    progressed = false

    for (const id of graph.nodes) {
      if (emitted.has(id)) continue

      const dependencies: string[] = graph.edges.get(id) ?? []
      const ready: boolean = dependencies.every((dependency) => emitted.has(dependency))

      if (!ready) continue

      order.push(id)
      emitted.add(id)
      progressed = true
    }
  }

  const unresolved: string[] = graph.nodes.filter((id) => !emitted.has(id))

  return { order, unresolved, cycle: unresolved.length > 0 ? findCycle(graph) : null }
}

// Guarda de los editores: si atar fieldId a dependsOnFieldId cerraria un ciclo, mirando todas las
// aristas.
export function wouldCreateCycle(
  graph: FieldGraph,
  fieldId: string,
  dependsOnFieldId: string,
): boolean {
  // Un campo que se observa a si mismo es el ciclo mas corto posible.
  if (fieldId === dependsOnFieldId) return true

  const visited = new Set<string>()
  const stack: string[] = [dependsOnFieldId]

  while (stack.length > 0) {
    const id: string = stack.pop() as string

    if (id === fieldId) return true
    if (visited.has(id)) continue

    visited.add(id)

    for (const dependency of graph.edges.get(id) ?? []) {
      stack.push(dependency)
    }
  }

  return false
}

export function describeCycle(graph: FieldGraph, cycle: string[]): string {
  return cycle.map((id) => graph.byId.get(id)?.name ?? id).join(' → ')
}
