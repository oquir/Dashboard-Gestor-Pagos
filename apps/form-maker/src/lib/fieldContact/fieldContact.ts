import { CONTACT_FIELD_TYPES, EMAIL_FIELD_TYPE, TEL_FIELD_TYPE } from '../../constants/fieldTypes'
import type { FieldValidationRules } from '../../types/field'
import type { PatternRule, PhoneKind } from '../../types/fieldContact'
import { EMAIL_FORMAT, PHONE_FORMATS } from './fieldContact.constants'
import type { ContactField } from './fieldContact.types'

// Telefono y correo: texto con formato de fabrica y el type que abre el teclado del celular. El
// patron no se guarda en el campo, sale de aca: corregirlo alcanza a todos sin migrar. El del autor
// lo reemplaza entero.

export function isContactField(type: string): boolean {
  return CONTACT_FIELD_TYPES.includes(type)
}

export function isPhoneField(type: string): boolean {
  return type === TEL_FIELD_TYPE
}

// Ausente es celular, lo que pide casi todo formulario.
export function phoneKindOf(field: ContactField): PhoneKind {
  return field.phoneKind ?? 'celular'
}

export function builtInFormatOf(field: ContactField): PatternRule | undefined {
  if (isPhoneField(field.type)) return PHONE_FORMATS[phoneKindOf(field)]
  if (field.type === EMAIL_FIELD_TYPE) return EMAIL_FORMAT

  return undefined
}

// Un patron propio sin mensaje toma el del tipo.
export function effectivePattern(
  field: ContactField,
  rules: FieldValidationRules,
): PatternRule | undefined {
  const builtIn: PatternRule | undefined = builtInFormatOf(field)
  const pattern: string | undefined = rules.pattern || builtIn?.pattern

  if (!pattern) return undefined

  return { pattern, message: rules.message || builtIn?.message }
}
