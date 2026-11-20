import type { PdfComponentOption, PdfFontFamily, PdfFontOption, PdfMargins } from '../types'

// El perfil de conversion: el contrato con el back (docs/Pendientes-PDF.md §2.1 y §7.2). Vive solo
// aca; si el back termina con otro numero, se cambia en este archivo y nada mas.
// Carta, vertical, 5 mm por lado y una ventana de 778 px: asi 1 px CSS sale a 0,75 pt y lo que se
// ve al 100 % es lo que sale en el papel.
export const PDF_PAPER_WIDTH_MM: number = 215.9
export const PDF_PAPER_HEIGHT_MM: number = 279.4
export const PDF_BACK_MARGIN_MM: number = 5
export const PDF_WEB_PAGE_WIDTH_PX: number = 778

// Cuantos px CSS caben en un mm de papel. Sale de lo que hace el convertidor -- estirar 778 px al
// ancho util de la hoja -- y no de los 96 px por pulgada del navegador: los dos difieren en la
// cuarta cifra, y con esta el margen extra y la guia de fin de hoja caen donde el back los pone.
export const PDF_PX_PER_MM: number =
  PDF_WEB_PAGE_WIDTH_PX / (PDF_PAPER_WIDTH_MM - 2 * PDF_BACK_MARGIN_MM)

// Alto util de una hoja con solo los 5 mm del back: unos 1018 px.
export const PDF_SHEET_HEIGHT_PX: number =
  (PDF_PAPER_HEIGHT_MM - 2 * PDF_BACK_MARGIN_MM) * PDF_PX_PER_MM

// Tablas dentro de celdas, hasta este nivel (la suelta en la hoja es el 1). Las plantillas a mano
// llegan a 4, sobre todo para dibujar casillas; mas hondo ya no se puede editar con el mouse.
export const PDF_MAX_TABLE_DEPTH: number = 4

// Tamaño de una tabla nueva: columnas x filas.
export const PDF_NEW_TABLE_SIZE: { columns: number; rows: number } = { columns: 2, rows: 2 }

// Tope del margen extra por lado. Mas que esto ya no es un margen sino media hoja en blanco.
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

// px; con el perfil de carta son 8,25 pt, letra corriente de formulario. Cada celda puede cambiarla.
export const PDF_DEFAULT_FONT_SIZE: number = 11

// Interlineado del documento, sin unidad para que escale con la letra de cada celda. No puede ser
// "normal": cada motor lo calcula con las metricas de la fuente y lo redondea distinto (Arial a 8 px
// da 9 px en Chromium y 10-11 en Firefox), y 70 filas de un renglon suman decenas de px de
// diferencia. 1.15 es la proporcion de diseño de Arial.
export const PDF_LINE_HEIGHT: number = 1.15

// Resguardo a cada lado del contenido de la hoja. Una tabla con bordes colapsados pinta su borde de
// la orilla mitad adentro y mitad afuera: a lo ancho exacto de la hoja, la mitad de afuera caia en
// el pixel 778, que el lienzo recorta y el convertidor no pinta, y el borde derecho desaparecia.
export const PDF_EDGE_GUARD_PX: number = 1

// El zoom del lienzo del PDF. Llega mas lejos que el del formulario (150 %): una declaracion de una
// hoja va en letra de 8 px y hay que poder leerla. Solo cambia como se ve, nunca el diseño.
export const PDF_ZOOM_MIN: number = 0.5

export const PDF_ZOOM_MAX: number = 3

export const PDF_ZOOM_STEP: number = 0.25

export const PDF_ZOOM_PRESETS: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

// Cuanto acerca cada px de rueda con Ctrl (el mismo factor que el lienzo del formulario).
export const PDF_ZOOM_WHEEL_FACTOR: number = 0.002

// Los componentes de la celda (docs/Pendientes-PDF.md §3.3), en el orden de la barra lateral. La
// casilla y la fila repetible quedaron fuera por decision del usuario (2026-11-18).
export const PDF_COMPONENT_OPTIONS: PdfComponentOption[] = [
  { type: 'image', label: 'Imagen', description: 'Escudo, bandera o eslogan, por URL o base64' },
  { type: 'verticalText', label: 'Texto vertical', description: 'Sale como imagen PNG' },
  { type: 'nit', label: 'NIT con DV', description: 'El número y el dígito en cajas aparte' },
  { type: 'signatures', label: 'Firmas', description: 'Declarante, contador o revisor fiscal' },
  { type: 'barcode', label: 'Código de barras', description: 'La imagen la pone el back' },
  { type: 'qr', label: 'Código QR', description: 'La imagen la pone el back' },
  { type: 'stamp', label: 'Sello', description: 'La imagen del sello con la fecha encima' },
]

// Lo que deja reabrir un componente desde el .html: su tipo y su configuracion en JSON, en el
// elemento de afuera del componente. SelectPdf los ignora. La imagen (src) no va en el JSON: se lee
// del <img>, para no llevar dos veces un base64.
export const PDF_COMPONENT_ATTRIBUTE = {
  type: 'data-fm-component',
  config: 'data-fm-config',
} as const

// La clase que llevan las tablas del editor, en el lienzo y en el .html. El <style> del documento
// cuelga de ella lo que antes iba repetido en cada celda (relleno, alineacion arriba) y las clases
// del diseño. Prefijo fm-, que las clases del autor no pueden usar.
export const PDF_TABLE_CLASS: string = 'fm-t'

export const PDF_RESERVED_CLASS_PREFIX: string = 'fm-'

// El nombre de una clase del diseño: lo que CSS acepta sin escapar nada.
export const PDF_CLASS_NAME_PATTERN: RegExp = /^[a-zA-Z_][a-zA-Z0-9_-]*$/

// Las propiedades de estilo de una celda o una clase (PdfStyleProps), para recorrerlas sin olvidar
// ninguna. Son tambien las que viajan en data-fm-props.
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
