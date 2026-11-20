import { NUMERIC_FIELD_TYPES, PRESENTATIONAL_FIELD_TYPES } from '../../constants/fieldTypes'
import type { CanvasField } from '../../types/field'

// Campos con valor contra presentacionales; preguntarlo aca para que paneles, schema y export no se
// desalineen. Un presentacional conserva posicion, estilos y visibleWhen; pierde validaciones,
// mapeo, script y reglas.

export function isPresentationalField(type: string): boolean {
  return PRESENTATIONAL_FIELD_TYPES.includes(type)
}

export function isInputField(type: string): boolean {
  return !isPresentationalField(type)
}

// Llegan al script como numero: un vacio vale 0.
export function isNumericField(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type)
}

export function findLabelFor(fields: CanvasField[], fieldId: string): CanvasField | null {
  return fields.find((field) => field.labelFor === fieldId) ?? null
}

// Indice para preguntar campo por campo: findLabelFor dentro de un bucle es cuadratico.
export function buildLinkedLabelIndex(fields: CanvasField[]): Map<string, CanvasField> {
  const index: Map<string, CanvasField> = new Map()

  // Gana la primera, como findLabelFor (un borrador manipulado podria traer dos).
  for (const field of fields) {
    if (field.labelFor && !index.has(field.labelFor)) index.set(field.labelFor, field)
  }

  return index
}

// Se calcula, nunca se guarda: el vinculo vive solo en la etiqueta.
export function hasLinkedLabel(fields: CanvasField[], fieldId: string): boolean {
  return findLabelFor(fields, fieldId) !== null
}

export function labelTargetCandidates(fields: CanvasField[], labelId: string): CanvasField[] {
  const current: string | undefined = fields.find((field) => field.id === labelId)?.labelFor

  return fields.filter((field) => {
    if (!isInputField(field.type)) return false
    // El destino actual sigue en la lista, o desapareceria de sus propias opciones.
    if (field.id === current) return true

    return !hasLinkedLabel(fields, field.id)
  })
}
