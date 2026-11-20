import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, ZOOM_WHEEL_FACTOR } from '../../constants'

// Aritmetica del zoom. Pura salvo getCanvasScale, que lee el DOM a proposito: el zoom vive en CSS.

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return ZOOM_MIN

  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

// Dos decimales: 0.1 + 0.6 da 0.7000000000000001 y nunca seria igual al tope.
export function zoomIn(zoom: number): number {
  return clampZoom(Math.round((zoom + ZOOM_STEP) * 100) / 100)
}

export function zoomOut(zoom: number): number {
  return clampZoom(Math.round((zoom - ZOOM_STEP) * 100) / 100)
}

// Continua y no a pasos: un pellizco del trackpad manda muchos eventos chicos.
export function wheelZoom(zoom: number, deltaY: number): number {
  return clampZoom(zoom * (1 - deltaY * ZOOM_WHEEL_FACTOR))
}

export function canZoomIn(zoom: number): boolean {
  return zoom < ZOOM_MAX
}

export function canZoomOut(zoom: number): boolean {
  return zoom > ZOOM_MIN
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`
}

// rect (escalado) / offsetWidth (maquetacion) = escala acumulada. Del DOM y no del store: no
// depende de pasarla y da exactamente 1 sin zoom. El error de redondeo (~0,05%) es despreciable.
export function getCanvasScale(element: HTMLElement | null): number {
  if (!element) return 1

  const layoutWidth: number = element.offsetWidth
  if (layoutWidth === 0) return 1

  return element.getBoundingClientRect().width / layoutWidth
}
