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

// Lista virtual de la vista JSON: solo se pintan las filas que se ven, mas un margen. Con la
// plantilla de ICA el JSON tiene unas 2.200 lineas, y pintarlas todas eran ~12.500 nodos que se
// volvian a armar con cada cambio del formulario: era la vista mas lenta de la app.
//
// La lista mide filas * alto fijo, asi el scroll y su barra son los de siempre; adentro, un relleno
// arriba empuja las pintadas hasta donde van. Se escucha el scroll de cualquier elemento (en fase de
// captura) porque quien desplaza depende de donde viva la vista: <main> en el lienzo, la propia caja
// en el panel del simulador.
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

  // Un pedido de llevar la vista a una linea, una sola vez por token: si el JSON cambia despues
  // (alguien edita un campo con el buscador abierto) la vista no vuelve a saltar sola.
  useLayoutEffect(() => {
    if (!reveal || !list || revealIndex < 0 || reveal.token === handledReveal.current) return

    handledReveal.current = reveal.token
    scrollRowIntoView(list, clipsRef.current, revealIndex)
    pendingInlineReveal.current = true
    update()
  })

  // Lo horizontal va despues, cuando la fila ya esta pintada: las lineas de scripts compilados son
  // largas y la coincidencia puede quedar fuera por la derecha. block 'nearest' no mueve lo vertical,
  // que ya quedo centrado.
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
