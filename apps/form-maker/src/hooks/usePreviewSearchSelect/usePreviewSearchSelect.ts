import { useEffect, useMemo, useRef, useState } from 'react'
import type { CatalogOption } from '../../types'
import type {
  UsePreviewSearchSelectParams,
  UsePreviewSearchSelectResult,
} from './usePreviewSearchSelect.types'
import { filterOptions, findSelected } from './usePreviewSearchSelect.utils'

// Modal del search_select: texto, opciones filtradas y la elegida. Aparte del select nativo porque
// montar 425 x 15 opciones es lo caro.
export function usePreviewSearchSelect({
  options,
  value,
  onChange,
}: UsePreviewSearchSelectParams): UsePreviewSearchSelectResult {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [query, setQuery] = useState<string>('')
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = findSelected(options, value)
  // Cerrado no se filtra nada: es justamente lo que evita las 6.375 opciones montadas de golpe.
  const results: CatalogOption[] = useMemo(
    () => (isOpen ? filterOptions(options, query) : []),
    [isOpen, options, query],
  )

  useEffect(() => {
    if (!isOpen) return

    // Por ref y no con autoFocus, que las reglas de accesibilidad prohiben.
    searchRef.current?.focus()

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return {
    isOpen,
    query,
    searchRef,
    selected,
    results,
    // Cada apertura arranca con el buscador limpio, no con lo que se tipeo la vez anterior.
    open: () => {
      setQuery('')
      setIsOpen(true)
    },
    close: () => setIsOpen(false),
    setQuery,
    // Solo se puede elegir: no hay como dejar el campo vacio. Si sobra, se borra la fila del grupo
    // (la primera no: min 1).
    choose: (option) => {
      onChange(option.id)
      setIsOpen(false)
    },
  }
}
