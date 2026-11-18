import type { CssStyleMap, PdfComponent, PdfComponentType } from '../../types'

// Con que arranca cada componente. Las medidas van a la escala de la hoja de 778 px (las plantillas
// a mano estaban medidas para 1960 px: sus letras de 22 a 35 px del sello aca son unos 12). Las
// variables son las que hoy llena el back ({Code}, {FechaGuardado}, {Identificacion}…), como la
// plantilla de fabrica del ICA.
export const COMPONENT_DEFAULTS: { [T in PdfComponentType]: Extract<PdfComponent, { type: T }> } = {
  image: { type: 'image', src: '', height: 60 },
  verticalText: {
    type: 'verticalText',
    text: 'TEXTO VERTICAL',
    fontSize: 9,
    bold: true,
    direction: 'up',
  },
  nit: { type: 'nit', label: 'NIT', number: '{Identificacion}', dv: '{DV}' },
  signatures: {
    type: 'signatures',
    space: 30,
    signers: [
      {
        title: 'FIRMA DEL DECLARANTE',
        details: 'NOMBRE: {Representante}\nC.C. No. {DocRepresentante}',
      },
      {
        title: 'FIRMA DEL CONTADOR O REVISOR FISCAL',
        details: 'NOMBRE: {NombreContador}\nC.C. No. {DocContador}   T.P. {TarjetaProfesional}',
      },
    ],
  },
  barcode: { type: 'barcode', variable: 'Code', width: 300, height: 40 },
  qr: { type: 'qr', variable: 'CodigoQR', size: 80 },
  stamp: {
    type: 'stamp',
    src: '',
    width: 120,
    text: '{FechaGuardado}',
    fontSize: 12,
    top: 50,
    left: 50,
  },
}

// La caja de muestra de lo que no se puede pintar en el lienzo (lo llena el back, o falta la
// imagen): mide lo mismo que saldra, para que el lienzo no mienta en el alto.
export const PLACEHOLDER_STYLE: CssStyleMap = {
  display: 'inline-block',
  boxSizing: 'border-box',
  verticalAlign: 'middle',
  overflow: 'hidden',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: '#475569',
  fontFamily: 'Arial, sans-serif',
  fontSize: '9px',
  fontWeight: 'normal',
}

export const PLACEHOLDER_BORDER: string = '1px dashed #94a3b8'

// Barras y cuadros de mentira: solo para que se reconozca de lejos que es.
export const BARCODE_PATTERN: string =
  'repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 3px, #000 3px 4px, #fff 4px 7px)'

export const QR_PATTERN: string = 'repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0 / 10px 10px'

export const LABEL_CHIP_STYLE: CssStyleMap = {
  background: '#fff',
  padding: '0 3px',
  lineHeight: '1.2',
}

// La caja de una imagen sin medidas, en el lienzo.
export const PLACEHOLDER_SIZE: { width: number; height: number } = { width: 80, height: 40 }

export const CELL_BORDER: string = '1px solid #000'

// Un ancho del 1 % con nowrap encoge la celda a su texto: el truco de siempre para rotulos en una
// tabla de ancho completo, y lo entiende tambien el WebKit viejo del back.
export const SHRINK_CELL: CssStyleMap = { width: '1%', whiteSpace: 'nowrap' }

export const NIT_DV_WIDTH_PX: number = 18

// Avisos de imagenes. Una imagen que mide mas de 4 veces lo que se muestra ya sobra aun impresa
// (1 px CSS es 0,75 pt; a 300 ppp caben unos 3 puntos por px).
export const HEAVY_IMAGE_FACTOR: number = 4

// Un base64 desde este tamaño ya pesa en el guardado del navegador (unos 5 MB en total) y en cada
// declaracion que arma el back.
export const HEAVY_BASE64_BYTES: number = 150 * 1024

export const WEBP_SOURCE: RegExp = /^data:image\/webp[;,]|\.webp(?:[?#]|$)/i

export const BASE64_SOURCE: RegExp = /^data:[^,]*;base64,/i

// Una {Var} sola: la imagen la pone el back.
export const VARIABLE_SOURCE: RegExp = /^\{[^{}\s]+\}$/
