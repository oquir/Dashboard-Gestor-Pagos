import { CONCEPTS_PAYLOAD_KEY } from '../../constants/fieldConcept'
import type { ExportedField } from '../../types/exportForm'
import type { ConceptoPayload } from '../../types/fieldConcept'
import type { RuntimeModel, RuntimeSnapshot } from '../../types/formRuntime'
import { formatDateForPayload } from '../fieldDate/fieldDate'
import { isPresentationalField } from '../fieldKind/fieldKind'
import { ARRAY_MARKER, conceptEntry, setDeepValue } from './runtimePayload.utils'

// Payload desde lo escrito: solo lo mapeado y visible; los conceptos van en una lista al final. Una
// fecha con formato sale en ese formato: es el unico punto donde deja de ser AAAA-MM-DD.
export function buildPayload(
  model: RuntimeModel,
  snapshot: RuntimeSnapshot,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  const conceptos: ConceptoPayload[] = []

  for (const field of model.rootFields) {
    if (!snapshot.root.visible[field.name]) continue

    const path: string | null = mappedPath(field)
    if (path !== null) {
      setDeepValue(payload, path, formatDateForPayload(field, snapshot.root.values[field.name]))
      continue
    }

    const concepto: ConceptoPayload | null = conceptEntry(field, snapshot.root.values[field.name])
    if (concepto !== null) conceptos.push(concepto)
  }

  // Un concepto en un grupo no se recorre: la lista plana no sabria la repeticion.
  for (const [groupId, fields] of model.groupFields) {
    ;(snapshot.groups[groupId] ?? []).forEach((scope, index) => {
      for (const field of fields) {
        const path: string | null = mappedPath(field)
        if (path === null || !scope.visible[field.name]) continue

        // El "[]" de la ruta del grupo se cambia por la posicion real de la repeticion.
        setDeepValue(
          payload,
          path.replace(ARRAY_MARKER, `[${index}]`),
          formatDateForPayload(field, scope.values[field.name]),
        )
      }
    })
  }

  // La clave solo sale si el formulario declara conceptos: ICA manda el mismo objeto de antes.
  if (conceptFieldCount(model) > 0) payload[CONCEPTS_PAYLOAD_KEY] = conceptos

  return payload
}

export function mappedFieldCount(model: RuntimeModel): number {
  const groupFields: ExportedField[] = [...model.groupFields.values()].flat()

  return [...model.rootFields, ...groupFields].filter((field) => mappedPath(field) !== null).length
}

export function conceptFieldCount(model: RuntimeModel): number {
  return model.rootFields.filter((field) => field.apiBinding?.kind === 'concept').length
}

function mappedPath(field: ExportedField): string | null {
  if (isPresentationalField(field.type)) return null
  if (field.apiBinding?.kind !== 'mapped') return null

  return field.apiBinding.path
}
