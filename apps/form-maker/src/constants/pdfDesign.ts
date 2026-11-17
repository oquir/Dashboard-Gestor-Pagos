import type { PdfFontFamily, PdfFontOption, PdfMargins } from '../types'

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
