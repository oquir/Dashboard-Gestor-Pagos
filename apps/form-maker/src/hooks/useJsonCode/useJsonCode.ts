import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  buildJsonModel,
  buildJsonSearchIndex,
  computeVisibleRows,
  expandToLine,
  findJsonMatches,
  groupHighlightsByLine,
  longestRowLength,
} from '../../lib'
import type {
  JsonHighlight,
  JsonMatch,
  JsonModel,
  JsonRevealRequest,
  JsonVisibleRow,
} from '../../types'
import { NO_HIGHLIGHTS, NO_MATCHES, NO_SEARCH_INDEX } from './useJsonCode.constants'
import type { UseJsonCodeResult } from './useJsonCode.types'

// Estado de la vista JSON: que contenedores estan plegados y el buscador propio. Lo que necesita el
// DOM -que filas se pintan, llevar la vista hasta una linea- vive en useJsonViewport.
//
// El buscador existe porque la vista solo pinta las lineas que se ven: el Ctrl+F del navegador no
// encuentra lo que no esta en el DOM. Por eso Ctrl+F abre este y no el del navegador. Busca sobre
// el JSON entero, tambien dentro de lo plegado, y saltar a una coincidencia escondida abre lo que la
// tapa. El boton Copiar de las vistas no pasa por aca: copia el texto completo, no lo pintado.
export function useJsonCode(json: string, captureFind: boolean): UseJsonCodeResult {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const model: JsonModel = useMemo(() => buildJsonModel(json), [json])
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set())
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [query, setQueryState] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [reveal, setReveal] = useState<JsonRevealRequest | null>(null)
  const [focusRequest, setFocusRequest] = useState<number>(0)

  // El indice plegado cuesta un recorrido del JSON entero: solo se arma con el buscador abierto, y
  // se rehace con cada cambio del JSON para que las coincidencias sigan en vivo como la vista.
  const searchIndex: string[] = useMemo(
    () => (isOpen ? buildJsonSearchIndex(model) : NO_SEARCH_INDEX),
    [isOpen, model],
  )
  const matches: JsonMatch[] = useMemo(
    () => (isOpen ? findJsonMatches(searchIndex, query) : NO_MATCHES),
    [isOpen, searchIndex, query],
  )
  // Si el JSON cambia y quedan menos coincidencias, la actual se queda en la ultima.
  const current: number = matches.length === 0 ? -1 : Math.min(currentIndex, matches.length - 1)
  const highlights: Map<number, JsonHighlight[]> = useMemo(
    () => (matches.length === 0 ? NO_HIGHLIGHTS : groupHighlightsByLine(matches, current)),
    [matches, current],
  )

  const rows: JsonVisibleRow[] = useMemo(
    () => computeVisibleRows(model, collapsed),
    [model, collapsed],
  )
  const longestLine: number = useMemo(() => longestRowLength(model, rows), [model, rows])
  const revealIndex: number = reveal ? rows.findIndex((row) => row.lineIndex === reveal.line) : -1

  const toggle = useCallback((lineIndex: number): void => {
    setCollapsed((prev) => {
      const next: Set<number> = new Set(prev)
      if (next.has(lineIndex)) {
        next.delete(lineIndex)
      } else {
        next.add(lineIndex)
      }
      return next
    })
  }, [])

  // Las tres escrituras van en el mismo evento, asi el render que sigue ya tiene las filas abiertas
  // y revealIndex apunta a la fila correcta.
  function goTo(list: JsonMatch[], index: number): void {
    const match: JsonMatch | undefined = list[index]
    setCurrentIndex(index)
    if (!match) return

    setCollapsed((prev) => expandToLine(model, prev, match.line))
    setReveal((prev) => ({ line: match.line, token: (prev?.token ?? 0) + 1 }))
  }

  // Como el del navegador: cada tecla salta a la primera coincidencia.
  function setQuery(nextQuery: string): void {
    setQueryState(nextQuery)
    goTo(findJsonMatches(searchIndex, nextQuery), 0)
  }

  function next(): void {
    if (matches.length > 0) goTo(matches, (current + 1) % matches.length)
  }

  function previous(): void {
    if (matches.length > 0) goTo(matches, (current - 1 + matches.length) % matches.length)
  }

  // La consulta se conserva al cerrar: al volver a abrir sigue ahi, seleccionada para reemplazarla.
  function close(): void {
    setIsOpen(false)
  }

  // Sin captureFind solo se roba el Ctrl+F con el puntero o el foco adentro de esta vista.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
      if (event.key.toLowerCase() !== 'f') return

      const root: HTMLDivElement | null = rootRef.current
      if (!root) return
      if (!captureFind && !root.matches(':hover') && !root.contains(document.activeElement)) return

      event.preventDefault()
      setIsOpen(true)
      setFocusRequest((count) => count + 1)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [captureFind])

  // Despues del commit: la primera vez el input recien existe ahi.
  useEffect(() => {
    if (focusRequest === 0) return

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [focusRequest])

  return {
    rootRef,
    rows,
    toggle,
    longestLine,
    search: {
      isOpen,
      query,
      total: matches.length,
      currentIndex: current,
      setQuery,
      next,
      previous,
      close,
    },
    searchInputRef: inputRef,
    highlights: isOpen ? highlights : NO_HIGHLIGHTS,
    reveal,
    revealIndex,
  }
}
