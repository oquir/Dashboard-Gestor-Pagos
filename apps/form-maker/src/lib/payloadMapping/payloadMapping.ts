import type { CanvasField } from '../../types/field'
import type { JsonNode } from '../../types/jsonTree'
import type { MappingNode, OrphanBinding } from '../../types/payloadMapping'
import type { SchemaNode, SchemaNodeType } from '../../types/payloadSchema'
import { conceptKindOf, conceptOwners, isValidConceptId } from '../fieldConcept/fieldConcept'
import { resolveLeafType } from '../payloadSchema/payloadSchema'
import { buildNode, buildPathIndex } from './payloadMapping.utils'

// Cruza el contrato con lo mapeado: cobertura, desajustes de tipo, rutas huerfanas, hojas del host
// y el resumen de conceptos.

export { fieldMatchesLeaf } from './payloadMapping.utils'

export function buildMappingTree(schema: SchemaNode, fields: CanvasField[]): MappingNode {
  const index: Map<string, CanvasField> = buildPathIndex(fields)
  return buildNode(schema, '', index)
}

export function toPlainSummary(node: MappingNode): JsonNode {
  if (node.kind === 'object') {
    const result: { [key: string]: JsonNode } = {}

    for (const child of node.children) {
      result[child.key] = toPlainSummary(child)
    }

    return result
  }

  if (node.kind === 'array') {
    return node.item ? [toPlainSummary(node.item)] : '— grupo repetible —'
  }

  if (node.binding.kind === 'unmapped') {
    return '— sin mapear —'
  }

  if (node.binding.kind === 'host') {
    return node.binding.conflictingFieldLabel
      ? `⚠ lo define el aplicativo receptor (${node.binding.conflictingFieldLabel} apunta acá)`
      : '— lo define el aplicativo receptor —'
  }

  return node.binding.typeMismatch
    ? `← ${node.binding.fieldLabel} (⚠ tipo)`
    : `← ${node.binding.fieldLabel}`
}

// Los conceptos no estan en el contrato: se arman aparte y van al final, en ambar si falta el id o
// se repite.
export function summarizeConcepts(fields: CanvasField[]): JsonNode {
  const concepts: CanvasField[] = fields.filter(
    (field) => field.apiBinding?.kind === 'concept' && conceptKindOf(field.type) !== null,
  )
  if (concepts.length === 0) return '— ninguno —'

  const owners: Map<number, CanvasField[]> = conceptOwners(fields)

  return concepts.map((field) => {
    const name: string = field.label.trim() || field.name
    const id: number | undefined =
      field.apiBinding?.kind === 'concept' ? field.apiBinding.idConcepto : undefined

    if (!isValidConceptId(id)) return `⚠ ${name} · sin idConcepto`
    if ((owners.get(id) ?? []).length > 1) return `⚠ ${name} · idConcepto ${id} repetido`

    return `← ${name} · idConcepto ${id} · ${conceptKindOf(field.type)}`
  })
}

export function findOrphanBindings(schema: SchemaNode, fields: CanvasField[]): OrphanBinding[] {
  const orphans: OrphanBinding[] = []

  for (const field of fields) {
    if (field.apiBinding?.kind !== 'mapped') continue

    const resolved: SchemaNodeType | null = resolveLeafType(schema, field.apiBinding.path)

    if (resolved === null) {
      orphans.push({ fieldId: field.id, fieldLabel: field.label, path: field.apiBinding.path })
    }
  }

  return orphans
}
