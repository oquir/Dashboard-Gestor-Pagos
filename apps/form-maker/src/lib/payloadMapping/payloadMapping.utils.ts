import { NUMERIC_FIELD_TYPES } from '../../constants/fieldTypes'
import type { CanvasField } from '../../types/field'
import type { DateCapableField } from '../../types/fieldDate'
import type { LeafBindingStatus, MappingNode } from '../../types/payloadMapping'
import type { SchemaNode, SchemaNodeType } from '../../types/payloadSchema'
import { isDateRangeField } from '../fieldDate/fieldDate'

// Aca porque buildNode las necesita; payloadMapping.ts las reexporta y el ciclo de imports va en un
// solo sentido.
export function fieldMatchesSchemaType(fieldType: string, schemaType: SchemaNodeType): boolean {
  switch (schemaType) {
    case 'number':
      // El checkbox cuenta como numero: el contrato no tiene booleanos (0 o 1). Los selects contra
      // hojas numericas siguen avisando: hueco conocido.
      return NUMERIC_FIELD_TYPES.includes(fieldType) || fieldType === 'checkbox'
    case 'boolean':
      return fieldType === 'checkbox'
    case 'string':
      return !NUMERIC_FIELD_TYPES.includes(fieldType)
    default:
      return true
  }
}

// Un rango de fechas es un objeto: ninguna hoja escalar lo recibe.
export function fieldMatchesLeaf(field: DateCapableField, schemaType: SchemaNodeType): boolean {
  return !isDateRangeField(field) && fieldMatchesSchemaType(field.type, schemaType)
}

export function buildPathIndex(fields: CanvasField[]): Map<string, CanvasField> {
  const index: Map<string, CanvasField> = new Map()

  for (const field of fields) {
    if (field.apiBinding?.kind === 'mapped') {
      index.set(field.apiBinding.path, field)
    }
  }

  return index
}

export function buildNode(
  node: SchemaNode,
  path: string,
  index: Map<string, CanvasField>,
): MappingNode {
  if (node.type === 'object') {
    const children: MappingNode[] = (node.children ?? []).map((child) => {
      const childPath: string = path ? `${path}.${child.key}` : child.key
      return buildNode(child, childPath, index)
    })

    return { kind: 'object', key: node.key, children }
  }

  if (node.type === 'array') {
    const item: MappingNode | undefined = node.items
      ? buildNode(node.items, `${path}[]`, index)
      : undefined

    return { kind: 'array', key: node.key, item }
  }

  const matchedField: CanvasField | undefined = index.get(path)

  if (node.providedByHost) {
    const binding: LeafBindingStatus = {
      kind: 'host',
      conflictingFieldLabel: matchedField?.label,
    }

    return { kind: 'leaf', key: node.key, schemaType: node.type, binding }
  }

  const binding: LeafBindingStatus = matchedField
    ? {
        kind: 'mapped',
        fieldId: matchedField.id,
        fieldLabel: matchedField.label,
        typeMismatch: !fieldMatchesLeaf(matchedField, node.type),
      }
    : { kind: 'unmapped' }

  return { kind: 'leaf', key: node.key, schemaType: node.type, binding }
}
