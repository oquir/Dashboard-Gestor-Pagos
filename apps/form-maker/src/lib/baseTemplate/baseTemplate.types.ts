import type { CatalogFill, ConditionOperator, FieldValidationRules } from '../../types/field'

export interface TemplateCondition {
  field: string
  operator: ConditionOperator
  value?: string | number | boolean
}

export interface TemplateValidationOverride {
  when: TemplateCondition
  validations: FieldValidationRules
}

export interface TemplateRule {
  label?: string
  when: TemplateCondition[]
  script: string
}

export interface FieldSpec {
  name: string
  type: string
  label: string
  colSpan: number
  path?: string
  excluded?: boolean
  required?: boolean
  min?: number
  pattern?: string
  // Solo se muestra cuando falla el patron: buildZodSchema lo cuelga del .regex().
  message?: string
  validationOverrides?: TemplateValidationOverride[]
  script?: string
  alwaysDisabled?: boolean
  visibleWhen?: TemplateCondition
  enableWhen?: TemplateCondition
  rules?: TemplateRule[]
  dataSource?: TemplateDataSource
  // El campo al que rotula, por nombre (resolveTemplateConditions lo traduce a id). Solo en type
  // label.
  labelFor?: string
  inlineOptions?: boolean
}

// Reglas numericas con alcance propio: el redondeo nombra a los excluidos y el signo a los
// calculados incluidos; el prefijo reusa la lista del redondeo.
export interface NumericDefaults {
  roundingExceptions: string[]
  clampedCalculated: string[]
  decimals: number
  decimalsByField: Record<string, number>
  moneyPrefix: string
  suffixByField: Record<string, string>
}

// Como FieldDataSource pero por nombre: los uuid existen recien despues de buildRow.
export interface TemplateDataSource {
  catalog: string
  dependsOn?: string
  fills?: CatalogFill[]
}
