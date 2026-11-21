import type { SchemaNodeType } from './payloadSchema'

export type LeafBindingStatus =
  | { kind: 'unmapped' }
  | { kind: 'host'; conflictingFieldLabel?: string }
  | { kind: 'mapped'; fieldId: string; fieldLabel: string; typeMismatch: boolean }

export type MappingNode =
  | { kind: 'object'; key: string; children: MappingNode[] }
  | { kind: 'array'; key: string; item?: MappingNode }
  | { kind: 'leaf'; key: string; schemaType: SchemaNodeType; binding: LeafBindingStatus }

// contract incluye al campo que aun no eligio hoja.
export type PayloadDestination = 'contract' | 'concept' | 'excluded'

export interface OrphanBinding {
  fieldId: string
  fieldLabel: string
  path: string
}
