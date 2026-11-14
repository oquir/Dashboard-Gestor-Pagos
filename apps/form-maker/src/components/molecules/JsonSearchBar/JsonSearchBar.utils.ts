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

// La version larga ("3 de 41", "Sin resultados") con lugar; la corta ("3/41", "0/0") en una caja
// angosta, como el contador del buscador del navegador.
export function searchCountLabel(search: JsonSearchState): string {
  if (search.query.length === 0) return ''
  if (search.total === 0) return 'Sin resultados'

  return `${search.currentIndex + 1} de ${search.total}`
}

export function searchCountShortLabel(search: JsonSearchState): string {
  if (search.query.length === 0) return ''

  return `${search.currentIndex + 1}/${search.total}`
}
