import { NUMERIC_FIELD_TYPES } from '../../constants/fieldTypes'
import type { AffixSide } from '../../types/fieldAffix'
import type { AffixableField } from './fieldAffix.types'

// Prefijo y sufijo de un numero ($, X1000, kW): presentacion pura, nunca pegados al valor (un "$
// 1.000" viajaria como texto y seria NaN en los scripts).

export function supportsAffixes(type: string): boolean {
  return NUMERIC_FIELD_TYPES.includes(type)
}

// Se recorta aca y no al teclear (se comeria el espacio de "X 1000"). Un tipo sin afijos los ignora
// aunque queden en el store.
export function affixOf(field: AffixableField, side: AffixSide): string | undefined {
  if (!supportsAffixes(field.type)) return undefined

  const text: string | undefined = field[side]?.trim()

  return text ? text : undefined
}
