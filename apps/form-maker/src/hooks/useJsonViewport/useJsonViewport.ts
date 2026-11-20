import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { JSON_INITIAL_ROW_COUNT } from '../../constants'
import type { JsonRevealRequest, JsonRowRange } from '../../types'
import type { UseJsonViewportResult } from './useJsonViewport.types'
import {
  clippingAncestors,
  sameRange,
  scrollRowIntoView,
  visibleRowRange,
} from './useJsonViewport.utils'

// Lista virtual de la vista JSON: solo las filas visibles mas un margen (con ICA eran ~12.500 nodos
// rehechos en cada cambio). La lista mide filas * alto fijo, asi el scroll es el de siempre.
// Escucha el scroll de cualquier elemento en captura: quien desplaza depende de donde viva la
// vista.
export function useJsonViewport(
  rowCount: number,
  reveal: JsonRevealRequest | null,
  revealIndex: number,
): UseJsonViewportResult {
  const [list, setList] = useState<HTMLDivElement | null>(null)
  const [range, setRange] = useState<JsonRowRange>({ start: 0, end: JSON_INITIAL_ROW_COUNT })
  const clipsRef = useRef<HTMLElement[]>([])
  const handledReveal = useRef<number>(0)
  const pendingInlineReveal = useRef<boolean>(false)

  const update = useCallback((): void => {
    if (!list) return

    const next: JsonRowRange = visibleRowRange(list, clipsRef.current, rowCount)
    setRange((current) => (sameRange(current, next) ? current : next))
  }, [list, rowCount])

  // Antes de pintar: la primera medida nunca deja ver un frame con las filas equivocadas.
  useLayoutEffect(() => {
    if (!list) return

    clipsRef.current = clippingAncestors(list)
  }, [list])

  // Al montar y cada vez que cambia el numero de filas (plegar, otro JSON).
  useLayoutEffect(update, [update])

  useEffect(() => {
    if (!list) return

    const observer = new ResizeObserver(update)
    for (const clip of clipsRef.current) observer.observe(clip)
    document.addEventListener('scroll', update, { capture: true, passive: true })
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      document.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [list, update])

  // Una sola vez por token: si el JSON cambia despues, la vista no vuelve a saltar.
  useLayoutEffect(() => {
    if (!reveal || !list || revealIndex < 0 || reveal.token === handledReveal.current) return

    handledReveal.current = reveal.token
    scrollRowIntoView(list, clipsRef.current, revealIndex)
    pendingInlineReveal.current = true
    update()
  })

  // Lo horizontal despues, con la fila ya pintada (las lineas compiladas son largas).
  useLayoutEffect(() => {
    if (!pendingInlineReveal.current || !list) return

    const mark: Element | null = list.querySelector('[data-json-current]')
    if (!mark) return

    pendingInlineReveal.current = false
    mark.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })

  return {
    listRef: setList,
    range: {
      start: Math.min(range.start, rowCount),
      end: Math.min(range.end, rowCount),
    },
  }
}
