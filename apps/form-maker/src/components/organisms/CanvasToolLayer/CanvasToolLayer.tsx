import { useCanvasMarquee } from '../../../hooks'
import { useCanvasPan } from '../../../hooks'
import { useFormStore } from '../../../store'
import type { SelectionRect } from '../../../types'
import { MARQUEE_CLASSES } from './CanvasToolLayer.constants'

// Aparte de Canvas: el marco cambia en cada movimiento y redibuja solo este nodo.
export function CanvasToolLayer() {
  const canvasTool = useFormStore((state) => state.canvasTool)
  const marquee: SelectionRect | null = useCanvasMarquee(canvasTool === 'select')

  useCanvasPan(canvasTool === 'hand')

  if (!marquee) return null

  return (
    <div
      aria-hidden
      className={MARQUEE_CLASSES}
      style={{
        left: marquee.left,
        top: marquee.top,
        width: Math.max(0, marquee.right - marquee.left),
        height: Math.max(0, marquee.bottom - marquee.top),
      }}
    />
  )
}
