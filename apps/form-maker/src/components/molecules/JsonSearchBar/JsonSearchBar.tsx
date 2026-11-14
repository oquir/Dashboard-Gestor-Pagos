import { AngleDown2, AngleUp2, Magnifier, Xmark } from 'reicon-react'
import {
  SEARCH_BAR_CLASSES,
  SEARCH_BUTTON_CLASSES,
  SEARCH_COUNT_CLASSES,
  SEARCH_ICON_CLASSES,
  SEARCH_INPUT_CLASSES,
} from './JsonSearchBar.constants'
import type { JsonSearchBarProps } from './JsonSearchBar.types'
import { handleSearchKeyDown, searchCountLabel, searchCountShortLabel } from './JsonSearchBar.utils'

export function JsonSearchBar({ search, inputRef }: JsonSearchBarProps) {
  const hasMatches: boolean = search.total > 0

  return (
    <div role="search" className={SEARCH_BAR_CLASSES}>
      <Magnifier size={13} className={SEARCH_ICON_CLASSES} />
      <input
        ref={inputRef}
        type="text"
        value={search.query}
        onChange={(event) => search.setQuery(event.target.value)}
        onKeyDown={(event) => handleSearchKeyDown(event, search)}
        placeholder="Buscar en el JSON"
        aria-label="Buscar en el JSON"
        spellCheck={false}
        className={SEARCH_INPUT_CLASSES}
      />
      <span aria-live="polite" className={SEARCH_COUNT_CLASSES}>
        <span className="@xs:hidden">{searchCountShortLabel(search)}</span>
        <span className="hidden @xs:inline">{searchCountLabel(search)}</span>
      </span>
      <button
        type="button"
        onClick={search.previous}
        disabled={!hasMatches}
        title="Anterior (Shift+Enter)"
        aria-label="Coincidencia anterior"
        className={SEARCH_BUTTON_CLASSES}
      >
        <AngleUp2 size={13} />
      </button>
      <button
        type="button"
        onClick={search.next}
        disabled={!hasMatches}
        title="Siguiente (Enter)"
        aria-label="Coincidencia siguiente"
        className={SEARCH_BUTTON_CLASSES}
      >
        <AngleDown2 size={13} />
      </button>
      <button
        type="button"
        onClick={search.close}
        title="Cerrar (Esc)"
        aria-label="Cerrar la búsqueda"
        className={SEARCH_BUTTON_CLASSES}
      >
        <Xmark size={13} />
      </button>
    </div>
  )
}
