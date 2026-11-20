import type { CssStyleMap, PdfComponent, PdfComponentType } from '../../types'

// Medidas a la escala de la hoja de 778 px; variables que hoy llena el back.
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

// Caja de muestra del mismo tamano que lo que saldra: el lienzo no miente en el alto.
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

export const BARCODE_PATTERN: string =
  'repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 3px, #000 3px 4px, #fff 4px 7px)'

export const QR_PATTERN: string = 'repeating-conic-gradient(#000 0 25%, #fff 0 50%) 0 0 / 10px 10px'

export const LABEL_CHIP_STYLE: CssStyleMap = {
  background: '#fff',
  padding: '0 3px',
  lineHeight: '1.2',
}

export const PLACEHOLDER_SIZE: { width: number; height: number } = { width: 80, height: 40 }

export const CELL_BORDER: string = '1px solid #000'

// Ancho 1% con nowrap encoge la celda a su texto; lo entiende el WebKit viejo del back.
export const SHRINK_CELL: CssStyleMap = { width: '1%', whiteSpace: 'nowrap' }

export const NIT_DV_WIDTH_PX: number = 18

// Mas de 4 veces lo que se muestra ya sobra impresa (a 300 ppp caben ~3 puntos por px).
export const HEAVY_IMAGE_FACTOR: number = 4

// Desde aca un base64 pesa en el guardado (~5 MB) y en cada declaracion.
export const HEAVY_BASE64_BYTES: number = 150 * 1024

export const WEBP_SOURCE: RegExp = /^data:image\/webp[;,]|\.webp(?:[?#]|$)/i

export const BASE64_SOURCE: RegExp = /^data:[^,]*;base64,/i

// Una {Var} sola: la imagen la pone el back.
export const VARIABLE_SOURCE: RegExp = /^\{[^{}\s]+\}$/
