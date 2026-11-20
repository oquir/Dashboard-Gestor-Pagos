import { DATALIST_FIELD_TYPE } from '../../constants/fieldTypes'
import { SUGGESTION_SEPARATOR } from './fieldSuggestions.constants'
import type { SuggestionsField } from './fieldSuggestions.types'

// Sugerencias de un datalist: no son opciones, el valor es el texto escrito. El store guarda lo
// tecleado tal cual; lo que se dibuja y exporta sale limpio de suggestionsOf.

export function supportsSuggestions(type: string): boolean {
  return type === DATALIST_FIELD_TYPE
}

// Sin vacias ni repetidas (gana la primera): cada una es la key de su <option>.
export function suggestionsOf(field: SuggestionsField): string[] | undefined {
  if (!supportsSuggestions(field.type)) return undefined

  const entries: string[] = (field.suggestions ?? []).map((entry) => entry.trim())
  const unique: string[] = [...new Set(entries)].filter((entry) => entry.length > 0)

  return unique.length > 0 ? unique : undefined
}

// Partir y unir son inversos: el texto vuelve tal cual y el cursor no salta.
export function suggestionsText(field: SuggestionsField): string {
  return (field.suggestions ?? []).join(SUGGESTION_SEPARATOR)
}

export function parseSuggestionsText(text: string): string[] | undefined {
  return text === '' ? undefined : text.split(SUGGESTION_SEPARATOR)
}
