import type { KeyboardEvent } from 'react'
import type { JsonSearchState } from '../../../types'

// Las teclas del buscador del navegador: Enter baja, Shift+Enter sube, Escape cierra.
export function handleSearchKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  search: JsonSearchState,
): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (event.shiftKey) search.previous()
    else search.next()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    search.close()
  }
}

// Larga con lugar ("3 de 41"), corta en caja angosta ("3/41").
export function searchCountLabel(search: JsonSearchState): string {
  if (search.query.length === 0) return ''
  if (search.total === 0) return 'Sin resultados'

  return `${search.currentIndex + 1} de ${search.total}`
}

export function searchCountShortLabel(search: JsonSearchState): string {
  if (search.query.length === 0) return ''

  return `${search.currentIndex + 1}/${search.total}`
}
