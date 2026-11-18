import type { PdfVerticalTextImage, PdfVerticalTextSpec } from '../../types'
import {
  VERTICAL_TEXT_CACHE_LIMIT,
  VERTICAL_TEXT_LINE_HEIGHT,
  VERTICAL_TEXT_PADDING_PX,
  VERTICAL_TEXT_SCALE,
} from './pdfVerticalText.constants'

// El PNG del texto vertical del PDF (docs/Pendientes-PDF.md §3.3). Sale como imagen y no con
// writing-mode porque el WebKit viejo de SelectPdf no lo pinta bien: es lo que hoy se hace a mano
// con unas 27 imagenes. Toca el DOM (un <canvas>): lo llaman el lienzo y la publicacion, nunca la
// lib pura de componentes, que lo recibe como parametro. Fuera de lib/index.ts.
//
// El mismo PNG va al lienzo y al .html, asi que lo que se ve es lo que sale. Se recuerda por
// configuracion: el lienzo pinta en cada cambio.

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

// Se mide y se dibuja acostado y despues se gira: "length" es lo largo del texto (el alto del PNG)
// y "thickness" lo que suman sus lineas (el ancho).
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
