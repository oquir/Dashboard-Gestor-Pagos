import { PLACEHOLDER_CAPABLE_FIELD_TYPES } from '../../constants/fieldTypes'
import type { PlaceholderField } from './fieldPlaceholder.types'

// Texto gris de un campo vacio: presentacion pura, nunca entra en el valor. La fecha no lo lleva:
// su caja ya muestra el formato.

export function supportsPlaceholder(type: string): boolean {
  return PLACEHOLDER_CAPABLE_FIELD_TYPES.includes(type)
}

// Se recorta aca y no al teclear. Un tipo sin placeholder lo ignora aunque quede en el store.
export function placeholderOf(field: PlaceholderField): string | undefined {
  if (!supportsPlaceholder(field.type)) return undefined

  const text: string | undefined = field.placeholder?.trim()

  return text ? text : undefined
}
