import type { CatalogColumn } from './catalog'
import type { PhoneKind } from './fieldContact'
import type { DateBound, DateFormatId } from './fieldDate'
import type { RichTextContent } from './richText'

// Aparte de FieldValidations para que un override no pueda anidar overrides.
export interface FieldValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  message?: string
  // Solo fecha. Ver lib/dateBound.
  minDate?: DateBound
  maxDate?: DateBound
}

// Se fusiona sobre la base: lo que no declara se hereda.
export interface FieldValidationOverride {
  id: string
  when: FieldCondition
  validations: FieldValidationRules
}

export interface FieldValidations extends FieldValidationRules {
  // Gana el primero que se cumpla, tambien en el consumidor.
  overrides?: FieldValidationOverride[]
}

export interface FieldStyles {
  customCss?: string
  marginTop?: string
  marginBottom?: string
  backgroundColor?: string
  textColor?: string
}

// CSS plano camelCase para `style`, no clases: Tailwind no escanea el fuente del consumidor. Ver
// lib/cssStyles.
export type CssStyleMap = Record<string, string>

// Un solo lenguaje de calculo: las reglas son estructura declarativa cuyo efecto habla el script.
export interface FieldLogic {
  script?: string
  rules?: FieldRule[]
}

export interface FieldOption {
  id: string
  label: string
}

export interface FieldFileConfig {
  acceptedFormats: string[]
  maxSizeMB: number
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface FieldTooltip {
  content: RichTextContent
  position: TooltipPosition
  customCss?: string
}

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'startsWith'
  | 'endsWith'
  | 'contains'
  | 'matches'
  | 'in'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isTruthy'
  | 'isFalsy'

export type ConditionKind = 'enable' | 'visible'

export interface FieldCondition {
  fieldId: string
  operator: ConditionOperator
  value?: string | number | boolean
}

export interface RuleCondition extends FieldCondition {
  id: string
}

// source habla el lenguaje de logic.script ({{campo}} y return), no uno de formulas.
export type RuleEffect =
  | { id: string; kind: 'script'; source: string }
  | { id: string; kind: 'constant'; value: string | number | boolean }

export interface FieldRule {
  id: string
  label?: string
  matchAll: boolean
  when: RuleCondition[]
  effects: RuleEffect[]
}

// concept: lo que el contrato fijo no contempla; sin idConcepto la revision de exportacion bloquea.
// Ver lib/fieldConcept.
export type ApiBinding =
  { kind: 'mapped'; path: string } | { kind: 'excluded' } | { kind: 'concept'; idConcepto?: number }

// Vive en el campo que origina la seleccion, no en los que se llenan: un solo dueno, como labelFor.
export interface CatalogFill {
  column: CatalogColumn
  // Id del destino; se resuelve a nombre al exportar.
  field: string
}

// dependsOn: id del campo padre (departamento -> municipios), a nombre al exportar.
export interface FieldDataSource {
  catalog: string
  dependsOn?: string
  fills?: CatalogFill[]
}

export interface CanvasField {
  id: string
  name: string
  type: string
  label: string
  colStart: number
  colSpan: number
  validations: FieldValidations
  styles: FieldStyles
  logic: FieldLogic
  title?: string
  options?: FieldOption[]
  fileConfig?: FieldFileConfig
  alwaysDisabled?: boolean
  enableWhen?: FieldCondition
  visibleWhen?: FieldCondition
  apiBinding?: ApiBinding
  dataSource?: FieldDataSource
  labelFor?: string
  content?: RichTextContent
  tooltip?: FieldTooltip
  // Al millar. Booleano porque nunca aparecio otro multiplo; ver lib/fieldRounding.
  rounding?: boolean
  // Solo presentacion: el estado guarda el numero. Ver lib/numberFormat.
  formatted?: boolean
  // Ausente admite negativos: solo false restringe, para no recortar borradores ya guardados.
  allowsNegative?: boolean
  // Recorta el valor, no solo la vista. Ver lib/fieldRounding.
  decimals?: number
  // Solo presentacion, nunca entran en el valor. Ver lib/fieldAffix.
  prefix?: string
  suffix?: string
  // Solo presentacion. Ver lib/fieldPlaceholder.
  placeholder?: string
  // Solo datalist, tal cual se tecleo (vacias incluidas). No limitan el valor. Ver
  // lib/fieldSuggestions.
  suggestions?: string[]
  // Ausente es celular: el store solo guarda fijo o fax. Ver lib/fieldContact.
  phoneKind?: PhoneKind
  // Solo radio_group y checkbox_group. Ver lib/fieldOptions.
  inlineOptions?: boolean
  // Cambia la forma del valor a { desde, hasta }. Ver lib/fieldDate.
  dateRange?: boolean
  // El valor pasa a AAAA-MM-DDTHH:mm.
  includesTime?: boolean
  // Solo en el input y el payload: por dentro sigue AAAA-MM-DD. Ausente = input del navegador. Ver
  // lib/dateFormat.
  dateFormat?: DateFormatId
}
