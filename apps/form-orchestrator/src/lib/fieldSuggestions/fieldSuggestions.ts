import { DATALIST_FIELD_TYPE } from '../../constants/fieldTypes'
import { SUGGESTION_SEPARATOR } from './fieldSuggestions.constants'
import type { SuggestionsField } from './fieldSuggestions.types'

// Las sugerencias de un datalist: lo que el navegador ofrece mientras se escribe. No son opciones
// -- no dicen que valores existen ni se guarda un id --: el valor es el texto del campo, se elija
// una sugerencia o no. Por eso el datalist valida, se mapea y entra a los scripts como un texto, y
// para obligar a elegir de una lista estan select y search_select.
//
// El store guarda lo tecleado tal cual, una entrada por linea del panel, vacias incluidas: limpiar
// en cada tecla se comeria el salto de linea recien escrito. Lo que se dibuja y lo que se exporta
// sale de suggestionsOf, ya limpio.

export function supportsSuggestions(type: string): boolean {
  return type === DATALIST_FIELD_TYPE
}

// Sin vacias ni repetidas, y gana la primera, como al pegar un catalogo: cada sugerencia es la key
// de su <option>, y una repetida saldria dos veces en la lista.
export function suggestionsOf(field: SuggestionsField): string[] | undefined {
  if (!supportsSuggestions(field.type)) return undefined

  const entries: string[] = (field.suggestions ?? []).map((entry) => entry.trim())
  const unique: string[] = [...new Set(entries)].filter((entry) => entry.length > 0)

  return unique.length > 0 ? unique : undefined
}

// Ida y vuelta con el textarea del panel. Partir y unir por el mismo separador son inversos, asi
// que el texto vuelve tal cual se escribio y el cursor no salta.
export function suggestionsText(field: SuggestionsField): string {
  return (field.suggestions ?? []).join(SUGGESTION_SEPARATOR)
}

export function parseSuggestionsText(text: string): string[] | undefined {
  return text === '' ? undefined : text.split(SUGGESTION_SEPARATOR)
}
