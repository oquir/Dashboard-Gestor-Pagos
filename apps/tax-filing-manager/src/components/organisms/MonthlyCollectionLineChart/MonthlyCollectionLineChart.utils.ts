import {
  FULL_MONTHS,
  WIDTH,
  PADDING,
  PLOT_WIDTH,
  TOOLTIP_WIDTH,
} from './MonthlyCollectionLineChart.constants'

/** El máximo en potencia de 10 para que esten las cifras redondas */
export function niceMaximum(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

/** Coordenada X del puntero en unidades del lienzo */
export function svgXFromClientX(clientX: number, svg: SVGSVGElement): number {
  const rect = svg.getBoundingClientRect()
  return ((clientX - rect.left) / rect.width) * WIDTH
}

/** Índice del mes más cercano a esa coordenada */
export function monthIndexAt(svgX: number): number {
  const step = PLOT_WIDTH / (FULL_MONTHS.length - 1)
  const index = Math.round((svgX - PADDING.left) / step)
  return Math.min(FULL_MONTHS.length - 1, Math.max(0, index))
}

/** Ancho estimado de la píldora de un mes, para el texto a 11px. */
export function monthPillWidth(label: string): number {
  return label.length * 6.4 + 14
}

/** La tarjeta se voltea a la izquierda cuando ya no cabe a la derecha de la columna */
export function tooltipFlipsToLeft(svgX: number): boolean {
  return svgX + 12 + TOOLTIP_WIDTH > WIDTH - PADDING.right
}
