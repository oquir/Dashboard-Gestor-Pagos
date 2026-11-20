import type { PdfComponentOption, PdfFontFamily, PdfFontOption, PdfMargins } from '../types'

// Perfil de conversion: el contrato con el back (Pendientes-PDF §2.1 y §7.2). Carta, vertical, 5 mm
// por lado y ventana de 778 px: 1 px CSS = 0,75 pt.
export const PDF_PAPER_WIDTH_MM: number = 215.9
export const PDF_PAPER_HEIGHT_MM: number = 279.4
export const PDF_BACK_MARGIN_MM: number = 5
export const PDF_WEB_PAGE_WIDTH_PX: number = 778

// Sale de estirar 778 px al ancho util, no de 96 px por pulgada: asi el margen y la guia caen donde
// los pone el back.
export const PDF_PX_PER_MM: number =
  PDF_WEB_PAGE_WIDTH_PX / (PDF_PAPER_WIDTH_MM - 2 * PDF_BACK_MARGIN_MM)

// Alto util de una hoja con solo los 5 mm del back: unos 1018 px.
export const PDF_SHEET_HEIGHT_PX: number =
  (PDF_PAPER_HEIGHT_MM - 2 * PDF_BACK_MARGIN_MM) * PDF_PX_PER_MM

// Profundidad de tablas anidadas (la de la hoja es 1). Las plantillas llegan a 4.
export const PDF_MAX_TABLE_DEPTH: number = 4

export const PDF_NEW_TABLE_SIZE: { columns: number; rows: number } = { columns: 2, rows: 2 }

// Mas que esto ya no es margen sino media hoja en blanco.
export const PDF_MAX_EXTRA_MARGIN_MM: number = 40

export const PDF_NO_EXTRA_MARGINS: PdfMargins = { top: 0, right: 0, bottom: 0, left: 0 }

export const PDF_FONT_OPTIONS: PdfFontOption[] = [
  { family: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { family: 'Helvetica', stack: 'Helvetica, Arial, sans-serif' },
  { family: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { family: 'Courier New', stack: '"Courier New", Courier, monospace' },
  { family: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { family: 'Tahoma', stack: 'Tahoma, Verdana, sans-serif' },
]

export const PDF_DEFAULT_FONT: PdfFontFamily = 'Arial'

// px: 8,25 pt con el perfil de carta.
export const PDF_DEFAULT_FONT_SIZE: number = 11

// Sin unidad y no "normal": cada motor redondea "normal" distinto y 70 filas suman decenas de px.
// 1.15 es la de Arial.
export const PDF_LINE_HEIGHT: number = 1.15

// El borde colapsado de la orilla cae mitad afuera: sin este resguardo, el pixel 778 se recorta y
// el borde derecho desaparece.
export const PDF_EDGE_GUARD_PX: number = 1

// Llega mas lejos que el formulario (150%): una hoja va en letra de 8 px. Solo cambia la vista.
export const PDF_ZOOM_MIN: number = 0.5

export const PDF_ZOOM_MAX: number = 3

export const PDF_ZOOM_STEP: number = 0.25

export const PDF_ZOOM_PRESETS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

// Cuanto acerca cada px de rueda con Ctrl (el mismo factor que el lienzo del formulario).
export const PDF_ZOOM_WHEEL_FACTOR: number = 0.002

// En el orden de la barra lateral. Casilla y fila repetible quedaron fuera (decision del usuario).
export const PDF_COMPONENT_OPTIONS: PdfComponentOption[] = [
  { type: 'image', label: 'Imagen', description: 'Escudo, bandera o eslogan, por URL o base64' },
  { type: 'verticalText', label: 'Texto vertical', description: 'Sale como imagen PNG' },
  { type: 'nit', label: 'NIT con DV', description: 'El número y el dígito en cajas aparte' },
  { type: 'signatures', label: 'Firmas', description: 'Declarante, contador o revisor fiscal' },
  { type: 'barcode', label: 'Código de barras', description: 'La imagen la pone el back' },
  { type: 'qr', label: 'Código QR', description: 'La imagen la pone el back' },
  { type: 'stamp', label: 'Sello', description: 'La imagen del sello con la fecha encima' },
]

// Para reabrir un componente desde el .html: tipo y configuracion en JSON. El src de la imagen se
// lee del <img> (no se duplica el base64).
export const PDF_COMPONENT_ATTRIBUTE = {
  type: 'data-fm-component',
  config: 'data-fm-config',
} as const

// Clase de las tablas del editor (lienzo y .html): el <style> cuelga de ella lo comun de las
// celdas.
export const PDF_TABLE_CLASS: string = 'fm-t'

export const PDF_RESERVED_CLASS_PREFIX: string = 'fm-'

// El nombre de una clase del diseño: lo que CSS acepta sin escapar nada.
export const PDF_CLASS_NAME_PATTERN: RegExp = /^[a-zA-Z_][a-zA-Z0-9_-]*$/

// Para recorrer todas las propiedades; son tambien las de data-fm-props.
export const PDF_STYLE_KEYS = [
  'fontSize',
  'bold',
  'italic',
  'align',
  'verticalAlign',
  'backgroundColor',
  'borders',
] as const

// Tope de quienes firman en un bloque de firmas: declarante, contador y revisor fiscal.
export const PDF_MAX_SIGNERS: number = 3
