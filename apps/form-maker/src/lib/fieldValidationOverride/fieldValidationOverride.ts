import { v4 as uuidv4 } from 'uuid'
import type { FieldValidationOverride } from '../../types/field'

// Validaciones condicionales de un campo. El orden es semantico: gana el primer override que se
// cumpla; si ninguno, la base.

export function createValidationOverride(): FieldValidationOverride {
  // Nace sin campo observado: el editor obliga a elegirlo, y resolveValidations descarta los que no
  // resuelven.
  return {
    id: uuidv4(),
    when: { fieldId: '', operator: 'equals', value: '' },
    validations: {},
  }
}

// Sin condicion aplicaria siempre: se elimina entero.
export function pruneOverridesReferencing(
  overrides: FieldValidationOverride[] | undefined,
  fieldId: string,
): FieldValidationOverride[] | undefined {
  if (!overrides) return undefined

  return overrides.filter((override) => override.when.fieldId !== fieldId)
}
