import type { PdfVerticalTextImage, PdfVerticalTextSpec } from '../../types'
import {
  VERTICAL_TEXT_CACHE_LIMIT,
  VERTICAL_TEXT_LINE_HEIGHT,
  VERTICAL_TEXT_PADDING_PX,
  VERTICAL_TEXT_SCALE,
} from './pdfVerticalText.constants'

// PNG del texto vertical: writing-mode no lo pinta bien el WebKit de SelectPdf. Toca el DOM
// (<canvas>): lo llaman el lienzo y la publicacion, nunca la lib pura. Mismo PNG en el lienzo y el
// .html; se cachea por configuracion.

const cache: Map<string, PdfVerticalTextImage | null> = new Map()

export function renderVerticalTextPng(spec: PdfVerticalTextSpec): PdfVerticalTextImage | null {
  const key: string = JSON.stringify(spec)
  if (cache.has(key)) return cache.get(key) ?? null

  const image: PdfVerticalTextImage | null = draw(spec)
  if (cache.size >= VERTICAL_TEXT_CACHE_LIMIT) {
    const oldest: string | undefined = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, image)
  return image
}

// Se dibuja acostado y se gira: length es el alto del PNG y thickness el ancho.
function draw(spec: PdfVerticalTextSpec): PdfVerticalTextImage | null {
  if (typeof document === 'undefined') return null
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const measurer: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!measurer) return null

  const font: string = `${spec.bold ? 'bold ' : ''}${spec.fontSize}px ${spec.fontStack}`
  const lines: string[] = spec.text.split('\n')
  measurer.font = font
  const widest: number = Math.max(...lines.map((line) => measurer.measureText(line).width))
  const lineHeight: number = Math.ceil(spec.fontSize * VERTICAL_TEXT_LINE_HEIGHT)
  const length: number = Math.ceil(widest) + 2 * VERTICAL_TEXT_PADDING_PX
  const thickness: number = lineHeight * lines.length

  canvas.width = thickness * VERTICAL_TEXT_SCALE
  canvas.height = length * VERTICAL_TEXT_SCALE
  // Cambiar el tamaño del canvas borra su estado (la fuente tambien): se vuelve a pedir.
  const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!context) return null
  context.scale(VERTICAL_TEXT_SCALE, VERTICAL_TEXT_SCALE)
  // up: se lee de abajo hacia arriba y la primera linea queda a la izquierda. down: de arriba hacia
  // abajo, y la primera linea a la derecha (como writing-mode: vertical-rl).
  if (spec.direction === 'up') {
    context.translate(0, length)
    context.rotate(-Math.PI / 2)
  } else {
    context.translate(thickness, 0)
    context.rotate(Math.PI / 2)
  }
  context.font = font
  context.fillStyle = '#000'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  lines.forEach((line, index) => {
    context.fillText(line, length / 2, lineHeight * (index + 0.5))
  })

  try {
    return { src: canvas.toDataURL('image/png'), width: thickness, height: length }
  } catch {
    return null
  }
}
