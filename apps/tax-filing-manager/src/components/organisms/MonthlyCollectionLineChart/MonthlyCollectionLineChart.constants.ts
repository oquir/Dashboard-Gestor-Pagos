/** Meses completos, para el eje X del Reporte general. */
export const FULL_MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

/** Lienzo SVG: el ancho deja respirar 12 meses con nombres completos. */
export const WIDTH = 960
export const HEIGHT = 320
/** Márgenes internos: el izquierdo deja espacio para las etiquetas en millones. */
export const PADDING = { top: 16, right: 34, bottom: 32, left: 52 }
/** Divisiones horizontales de la rejilla. */
export const TICKS = 4
/** Ancho y alto del área de trazado, dentro de los márgenes del lienzo. */
export const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
export const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom
/** Ancho de la tarjeta flotante (w-56 en el JSX): con él se decide cuándo volcarla a la izquierda. */
export const TOOLTIP_WIDTH = 224
/** Radios de los puntos de las series */
export const DOT_RADIUS = 3
export const ACTIVE_DOT_RADIUS = 5
