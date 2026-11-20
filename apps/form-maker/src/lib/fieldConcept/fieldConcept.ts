import { CONCEPT_ID_MAX, CONCEPT_KIND_BY_FIELD_TYPE } from '../../constants/fieldConcept'
import type { CanvasField } from '../../types/field'
import type { ConceptValueKind } from '../../types/fieldConcept'

// Conceptos tributarios: tercer destino del valor, en la lista conceptos del payload con el id de
// la tabla del backend. El tipo de dato no se guarda: sale del tipo del campo.

export function conceptKindOf(fieldType: string): ConceptValueKind | null {
  return CONCEPT_KIND_BY_FIELD_TYPE[fieldType] ?? null
}

export function isValidConceptId(id: number | undefined): id is number {
  return id !== undefined && Number.isInteger(id) && id > 0 && id <= CONCEPT_ID_MAX
}

// Solo digitos; lo invalido queda ausente y lo reporta la revision.
export function parseConceptId(raw: string): number | undefined {
  const trimmed: string = raw.trim()
  if (!/^\d+$/.test(trimmed)) return undefined

  const id: number = Number(trimmed)
  return isValidConceptId(id) ? id : undefined
}

// Agrupados por id: dos en la misma lista se pisarian del otro lado.
export function conceptOwners(fields: CanvasField[]): Map<number, CanvasField[]> {
  const owners: Map<number, CanvasField[]> = new Map()

  for (const field of fields) {
    const binding = field.apiBinding
    if (binding?.kind !== 'concept' || conceptKindOf(field.type) === null) continue
    if (!isValidConceptId(binding.idConcepto)) continue

    owners.set(binding.idConcepto, [...(owners.get(binding.idConcepto) ?? []), field])
  }

  return owners
}
