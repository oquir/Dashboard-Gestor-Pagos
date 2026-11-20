import { LENGTH_CAPABLE_FIELD_TYPES } from '../../constants/fieldTypes'
import type { AuthoredLengthField, LengthLimitedField } from './fieldLength.types'

// Cuanto se puede escribir: validations.maxLength leido segun el tipo. Texto: caracteres. Numero:
// digitos de la parte entera, porque el texto cambia con formatted, el signo y los decimales.
// No cambia el valor: se frena el tecleo y el schema rechaza el resto.

export function supportsMaxLength(type: string): boolean {
  return LENGTH_CAPABLE_FIELD_TYPES.includes(type)
}

// Cero es un numero a medio escribir: se lee como ausente. Lo usan el schema y el input, asi no
// discrepan.
export function effectiveMaxLength(declared: number | undefined): number | undefined {
  return declared !== undefined && declared > 0 ? declared : undefined
}

// Lo que el input tiene que aplicar, leido del campo ya exportado.
export function maxLengthOf(field: LengthLimitedField): number | undefined {
  return supportsMaxLength(field.type) ? effectiveMaxLength(field.maxLength) : undefined
}

// Ademas del schema, para frenar el tecleo. Lleva el tope de base aunque un override lo apriete: el
// teclado nunca rechaza algo legal y el schema caza el resto.
export function exportableMaxLength(field: AuthoredLengthField): number | undefined {
  return supportsMaxLength(field.type) ? effectiveMaxLength(field.validations.maxLength) : undefined
}
