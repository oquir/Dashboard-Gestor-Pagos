import type { FieldTypeDef } from '../types/fieldTypes'

export const OPTION_BASED_FIELD_TYPES: string[] = [
  'select',
  'search_select',
  'toggle_group',
  'radio_group',
  'checkbox_group',
]

export const MULTI_VALUE_FIELD_TYPES: string[] = ['checkbox_group']

// Los que van en columna y pueden pasar a una linea; toggle_group ya es horizontal.
export const INLINE_CAPABLE_FIELD_TYPES: string[] = ['radio_group', 'checkbox_group']

// calculated y number se comportan igual; lo que hace a un campo de solo lectura es alwaysDisabled.
export const NUMERIC_FIELD_TYPES: string[] = ['number', 'calculated']

export const TEL_FIELD_TYPE = 'tel'

export const EMAIL_FIELD_TYPE = 'email'

// Texto libre con <datalist>: el valor es lo escrito, no un id, asi que valida y se mapea como
// texto.
export const DATALIST_FIELD_TYPE = 'datalist'

// Traen su propio formato: sin patron del autor validan con el del tipo.
export const CONTACT_FIELD_TYPES: string[] = [TEL_FIELD_TYPE, EMAIL_FIELD_TYPE]

// Texto cuenta caracteres; numeros, digitos enteros (lib/fieldLength).
export const LENGTH_CAPABLE_FIELD_TYPES: string[] = [
  'text',
  'textarea',
  TEL_FIELD_TYPE,
  EMAIL_FIELD_TYPE,
  DATALIST_FIELD_TYPE,
  'number',
  'calculated',
]

// La fecha no: su caja ya muestra el formato.
export const PLACEHOLDER_CAPABLE_FIELD_TYPES: string[] = [
  'text',
  'textarea',
  TEL_FIELD_TYPE,
  EMAIL_FIELD_TYPE,
  DATALIST_FIELD_TYPE,
  'number',
  'calculated',
  'select',
  'search_select',
]

export const PRESENTATIONAL_FIELD_TYPES: string[] = ['label', 'rich_text']

export const TOOLTIP_CAPABLE_FIELD_TYPES: string[] = [
  'text',
  TEL_FIELD_TYPE,
  EMAIL_FIELD_TYPE,
  DATALIST_FIELD_TYPE,
  'number',
  'date',
  'select',
  'checkbox',
  'calculated',
  'file',
  'toggle_group',
  'radio_group',
]

export const RICH_TEXT_FIELD_TYPE = 'rich_text'

export const DATE_FIELD_TYPE = 'date'
export const FIELD_TYPES: FieldTypeDef[] = [
  { type: 'text', label: 'Texto', category: 'basico' },
  { type: 'number', label: 'Número', category: 'basico' },
  { type: TEL_FIELD_TYPE, label: 'Teléfono', category: 'basico' },
  { type: EMAIL_FIELD_TYPE, label: 'Correo', category: 'basico' },
  { type: 'date', label: 'Fecha', category: 'basico' },
  { type: 'select', label: 'Lista desplegable', category: 'basico' },
  { type: 'textarea', label: 'Área de texto', category: 'basico' },
  { type: 'checkbox', label: 'Casilla', category: 'basico' },
  { type: 'calculated', label: 'Calculado', category: 'basico' },
  { type: 'file', label: 'Archivo', category: 'basico' },
  { type: 'search_select', label: 'Lista con búsqueda', category: 'complejo' },
  { type: DATALIST_FIELD_TYPE, label: 'Texto con sugerencias', category: 'complejo' },
  { type: 'toggle_group', label: 'Botones de selección', category: 'complejo' },
  { type: 'radio_group', label: 'Opción única', category: 'complejo' },
  { type: 'checkbox_group', label: 'Grupo de casillas', category: 'complejo' },
  { type: 'label', label: 'Etiqueta', category: 'contenido' },
  { type: 'rich_text', label: 'Texto con formato', category: 'contenido' },
]
