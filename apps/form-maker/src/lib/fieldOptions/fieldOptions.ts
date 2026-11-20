import {
  INLINE_CAPABLE_FIELD_TYPES,
  MULTI_VALUE_FIELD_TYPES,
  OPTION_BASED_FIELD_TYPES,
} from '../../constants'
import type { ApiBinding, CanvasField, FieldOption } from '../../types'
import type { InlineCapableField } from './fieldOptions.types'

// Quien pone las opciones de un select: solo un campo fuera del contrato (excluido o concepto) las
// lleva a mano; uno mapeado o sin decidir las recibe del catalogo del consumidor. Volver al
// contrato las descarta a proposito.

export function isOptionBasedField(type: string): boolean {
  return OPTION_BASED_FIELD_TYPES.includes(type)
}

export function isMultiValueField(type: string): boolean {
  return MULTI_VALUE_FIELD_TYPES.includes(type)
}

// Con dataSource no hay opciones a mano: el JSON tendria dos ordenes contradictorias.
export function allowsManualOptions(field: CanvasField): boolean {
  const kind: ApiBinding['kind'] | undefined = field.apiBinding?.kind

  return (
    isOptionBasedField(field.type) &&
    (kind === 'excluded' || kind === 'concept') &&
    field.dataSource === undefined
  )
}

export function exportableOptions(field: CanvasField): FieldOption[] | undefined {
  return allowsManualOptions(field) ? field.options : undefined
}

// Ausente: una debajo de otra. Solo presentacion: no toca valor, schema ni cuantas se eligen.
export function supportsInlineOptions(type: string): boolean {
  return INLINE_CAPABLE_FIELD_TYPES.includes(type)
}

export function showsOptionsInline(field: InlineCapableField): boolean {
  return Boolean(field.inlineOptions) && supportsInlineOptions(field.type)
}

export function exportableInlineOptions(field: InlineCapableField): true | undefined {
  return showsOptionsInline(field) ? true : undefined
}
