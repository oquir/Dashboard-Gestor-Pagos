import type {
  CssStyleMap,
  PdfBarcodeComponent,
  PdfComponent,
  PdfComponentContext,
  PdfComponentType,
  PdfImageCheck,
  PdfImageComponent,
  PdfNitComponent,
  PdfQrComponent,
  PdfSignaturesComponent,
  PdfStampComponent,
  PdfVerticalTextComponent,
  PdfVerticalTextImage,
} from '../../types'
import { fontStack } from '../pdfDesign'
import { isSafePdfImageSrc, pdfAttributes } from '../pdfHtml'
import {
  BARCODE_PATTERN,
  BASE64_SOURCE,
  CELL_BORDER,
  COMPONENT_DEFAULTS,
  HEAVY_BASE64_BYTES,
  HEAVY_IMAGE_FACTOR,
  NIT_DV_WIDTH_PX,
  PLACEHOLDER_SIZE,
  QR_PATTERN,
  SHRINK_CELL,
  VARIABLE_SOURCE,
  WEBP_SOURCE,
} from './pdfComponents.constants'
import {
  componentAttributes,
  element,
  placeholder,
  sizeStyle,
  textHtml,
} from './pdfComponents.utils'

// Los componentes de celda del PDF (docs/Pendientes-PDF.md §3.3): solo el machetazo que se repite
// entre municipios -- imagen, texto vertical, NIT con DV, firmas, codigo de barras, QR y sello. La
// casilla y la fila repetible quedaron fuera por decision del usuario (2026-11-18).
//
// Un componente es una configuracion; su HTML sale de aca, el mismo para el lienzo y para el .html
// final (cambia solo lo que el lienzo no puede pintar: lo que llena el back sale como una caja de
// muestra del mismo tamaño). Solo tablas, imagenes y bloques: nada de flex ni grid, que el WebKit
// viejo del back no entiende. Lo que sale pasa despues por el saneo como cualquier HTML libre: un
// src que no es seguro se cae ahi. Pura, sin DOM: el PNG del texto vertical lo dibuja quien llama
// (ctx.renderVerticalText). Fuera de lib/index.ts, como el resto del diseñador.

export function createPdfComponent(type: PdfComponentType): PdfComponent {
  return structuredClone(COMPONENT_DEFAULTS[type])
}

export function pdfComponentHtml(component: PdfComponent, ctx: PdfComponentContext): string {
  switch (component.type) {
    case 'image':
      return imageHtml(component, ctx)
    case 'verticalText':
      return verticalTextHtml(component, ctx)
    case 'nit':
      return nitHtml(component, ctx)
    case 'signatures':
      return signaturesHtml(component, ctx)
    case 'barcode':
      return backImageHtml(component, component.width, component.height, 'Código de barras', ctx)
    case 'qr':
      return backImageHtml(component, component.size, component.size, 'QR', ctx)
    case 'stamp':
      return stampHtml(component, ctx)
  }
}

// El texto que queda al pasar la celda a texto: lo que el autor escribio, si escribio algo.
export function pdfComponentText(component: PdfComponent): string {
  switch (component.type) {
    case 'verticalText':
    case 'stamp':
      return component.text
    case 'nit':
      return [component.label, component.number, 'DV', component.dv].filter(Boolean).join(' ')
    case 'signatures':
      return component.signers.map((signer) => signer.title).join(' / ')
    case 'barcode':
    case 'qr':
      return `{${component.variable}}`
    case 'image':
      return component.alt ?? ''
  }
}

// El nombre de una variable como lo guarda el componente: sin llaves ni espacios ("{Code}" → "Code").
export function cleanPdfVariable(value: string): string {
  return value.replace(/[{}\s]/g, '')
}

// Lo que conviene saber de la imagen de un componente antes de publicar. check es lo que se supo
// al cargarla (lo hace la barra lateral; aca no hay DOM). Avisos, no bloqueos.
export function pdfImageWarnings(
  src: string,
  check: PdfImageCheck,
  display: { width?: number; height?: number },
): string[] {
  const value: string = src.trim()
  if (value === '' || VARIABLE_SOURCE.test(value)) return []
  if (!isSafePdfImageSrc(value)) {
    return [
      'No es una URL completa (http o https), un base64 de imagen ni una {variable}: se quita al publicar. El back no tiene ruta base, así que la URL tiene que ser completa.',
    ]
  }

  const warnings: string[] = []
  if (WEBP_SOURCE.test(value)) {
    warnings.push('Es WebP: el WebKit viejo del back puede no pintarlo. Pásala a PNG o JPG.')
  }
  const bytes: number | null = base64Bytes(value)
  if (bytes !== null && bytes >= HEAVY_BASE64_BYTES) {
    warnings.push(
      `El base64 pesa ${Math.round(bytes / 1024)} KB: infla el HTML y el guardado del navegador. Mejor súbela al servidor de imágenes y pega la URL.`,
    )
  }
  if (check.status === 'error') warnings.push('No se pudo cargar la imagen: revisa la dirección.')
  if (check.status === 'ok') {
    const shown = displaySize(check.naturalWidth, check.naturalHeight, display)
    if (
      check.naturalWidth > shown.width * HEAVY_IMAGE_FACTOR ||
      check.naturalHeight > shown.height * HEAVY_IMAGE_FACTOR
    ) {
      warnings.push(
        `Mide ${check.naturalWidth} × ${check.naturalHeight} px y se muestra a ${shown.width} × ${shown.height}: pesa mucho más de lo que se ve. Achícala antes de subirla.`,
      )
    }
  }
  return warnings
}

// El tamaño en que se muestra: el que se pidio, con la proporcion de la imagen para lo que falte.
function displaySize(
  naturalWidth: number,
  naturalHeight: number,
  display: { width?: number; height?: number },
): { width: number; height: number } {
  const ratio: number = naturalHeight > 0 ? naturalWidth / naturalHeight : 1
  const width: number = display.width ?? (display.height ? display.height * ratio : naturalWidth)
  const height: number = display.height ?? (display.width ? display.width / ratio : naturalHeight)
  return { width: Math.round(width), height: Math.round(height) }
}

function base64Bytes(src: string): number | null {
  const match: RegExpExecArray | null = BASE64_SOURCE.exec(src)
  if (!match) return null
  const data: string = src.slice(match[0].length).replace(/\s/g, '')
  return Math.floor((data.length * 3) / 4)
}

// --- Cada componente ---

// Sin imagen, o con una que pone el back ({Logo}), el lienzo muestra una caja. En el archivo, sin
// imagen sale una marca vacia: no pinta nada y deja reabrir el componente.
function imageHtml(component: PdfImageComponent, ctx: PdfComponentContext): string {
  const src: string = component.src.trim()
  const attributes: string = componentAttributes(component)
  const isVariable: boolean = VARIABLE_SOURCE.test(src)

  if (src === '' || (ctx.mode === 'canvas' && isVariable)) {
    if (ctx.mode === 'file') return element('span', attributes, {}, '')
    const { width, height } = placeholderSize(component.width, component.height)
    return placeholder(attributes, width, height, src === '' ? 'Imagen' : src)
  }

  return element(
    'img',
    `${attributes}${pdfAttr('src', src)}${pdfAttr('alt', component.alt ?? '')}`,
    { verticalAlign: 'middle', ...sizeStyle(component.width, component.height) },
    null,
  )
}

// El PNG lo dibuja quien llama. Sin <canvas> (o en un script sin DOM) sale texto con writing-mode:
// se ve en un navegador moderno, aunque el WebKit del back lo pinte mal.
function verticalTextHtml(component: PdfVerticalTextComponent, ctx: PdfComponentContext): string {
  const attributes: string = componentAttributes(component)
  const text: string = component.text.trim() === '' ? '' : component.text
  if (text === '') {
    return ctx.mode === 'canvas'
      ? placeholder(attributes, 14, 60, '', { writingMode: 'vertical-rl' })
      : element('span', attributes, {}, '')
  }

  const image: PdfVerticalTextImage | null = ctx.renderVerticalText({
    text,
    fontStack: fontStack(component.fontFamily ?? ctx.fontFamily),
    fontSize: component.fontSize,
    bold: component.bold,
    direction: component.direction,
  })
  if (!image) {
    const style: CssStyleMap = {
      display: 'inline-block',
      writingMode: 'vertical-rl',
      fontSize: `${component.fontSize}px`,
      fontWeight: component.bold ? 'bold' : 'normal',
    }
    if (component.direction === 'up') style.transform = 'rotate(180deg)'
    return element('span', attributes, style, textHtml(text, 'file'))
  }

  return element(
    'img',
    `${attributes}${pdfAttr('src', image.src)}${pdfAttr('alt', text.replace(/\n/g, ' '))}`,
    { verticalAlign: 'middle', width: `${image.width}px`, height: `${image.height}px` },
    null,
  )
}

function nitHtml(component: PdfNitComponent, ctx: PdfComponentContext): string {
  const box: CssStyleMap = { border: CELL_BORDER, padding: '1px 3px' }
  const cells: string[] = []
  if (component.label.trim() !== '') {
    cells.push(
      element(
        'td',
        '',
        { ...SHRINK_CELL, padding: '0 4px 0 0' },
        textHtml(component.label, ctx.mode),
      ),
    )
  }
  cells.push(element('td', '', box, textHtml(component.number, ctx.mode) || '&nbsp;'))
  cells.push(element('td', '', { ...SHRINK_CELL, padding: '0 4px' }, 'DV'))
  cells.push(
    element(
      'td',
      '',
      { ...box, width: `${NIT_DV_WIDTH_PX}px`, textAlign: 'center' },
      textHtml(component.dv, ctx.mode) || '&nbsp;',
    ),
  )
  return table(componentAttributes(component), {}, [cells.join('')])
}

// Una columna por quien firma, del mismo ancho: el espacio para firmar, la raya con el titulo y los
// detalles debajo. La alineacion la pone la celda de afuera.
function signaturesHtml(component: PdfSignaturesComponent, ctx: PdfComponentContext): string {
  const columns: string = component.signers
    .map((signer) => {
      const details: string =
        signer.details.trim() === ''
          ? ''
          : element('div', '', {}, textHtml(signer.details, ctx.mode))
      return element(
        'td',
        '',
        { padding: '0 6px', verticalAlign: 'top' },
        [
          element('div', '', { height: `${component.space}px` }, ''),
          element(
            'div',
            '',
            { borderTop: CELL_BORDER, paddingTop: '2px', fontWeight: 'bold' },
            textHtml(signer.title, ctx.mode) || '&nbsp;',
          ),
          details,
        ].join(''),
      )
    })
    .join('')
  return table(componentAttributes(component), { tableLayout: 'fixed' }, [columns])
}

// Codigo de barras y QR: un <img src="{variable}"> que el back llena. En el lienzo no hay imagen
// todavia, asi que sale una muestra del mismo tamaño.
function backImageHtml(
  component: PdfBarcodeComponent | PdfQrComponent,
  width: number,
  height: number,
  label: string,
  ctx: PdfComponentContext,
): string {
  const attributes: string = componentAttributes(component)
  const variable: string = `{${component.variable}}`
  if (ctx.mode === 'canvas') {
    const background: string = component.type === 'qr' ? QR_PATTERN : BARCODE_PATTERN
    return placeholder(attributes, width, height, `${label} ${variable}`, {
      background,
      border: '0',
    })
  }
  return element(
    'img',
    `${attributes}${pdfAttr('src', variable)}${pdfAttr('alt', '')}`,
    { verticalAlign: 'middle', width: `${width}px`, height: `${height}px` },
    null,
  )
}

// Como lo hacen las 6 plantillas a mano que lo traen: la imagen y encima el texto en un <span>
// absoluto, corrido con translate para que top/left sean su centro. Va tambien con -webkit-transform
// mientras el back siga en el WebKit viejo, que no entiende transform sin prefijo.
function stampHtml(component: PdfStampComponent, ctx: PdfComponentContext): string {
  const src: string = component.src.trim()
  const showImage: boolean = src !== '' && !(ctx.mode === 'canvas' && VARIABLE_SOURCE.test(src))
  const height: number | undefined = component.height

  let image: string
  if (showImage) {
    image = element(
      'img',
      `${pdfAttr('src', src)}${pdfAttr('alt', '')}`,
      { display: 'block', ...sizeStyle(component.width, height) },
      null,
    )
  } else if (ctx.mode === 'canvas') {
    image = placeholder(
      '',
      component.width,
      height ?? component.width,
      src === '' ? 'Sello' : src,
      {
        display: 'block',
        borderRadius: '50%',
        lineHeight: '14px',
        paddingTop: '4px',
      },
    )
  } else {
    image = element('div', '', sizeStyle(component.width, height ?? component.width), '')
  }

  const text: string = element(
    'span',
    '',
    {
      position: 'absolute',
      top: `${component.top}%`,
      left: `${component.left}%`,
      WebkitTransform: 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)',
      fontSize: `${component.fontSize}px`,
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
    textHtml(component.text, ctx.mode),
  )

  return element(
    'div',
    componentAttributes(component),
    {
      position: 'relative',
      display: 'inline-block',
      verticalAlign: 'middle',
      width: `${component.width}px`,
    },
    `${image}${text}`,
  )
}

function table(attributes: string, style: CssStyleMap, rows: string[]): string {
  return element(
    'table',
    attributes,
    { borderCollapse: 'collapse', width: '100%', ...style },
    `<tbody>${rows.map((row) => `<tr>${row}</tr>`).join('')}</tbody>`,
  )
}

function placeholderSize(width?: number, height?: number): { width: number; height: number } {
  if (width !== undefined && height !== undefined) return { width, height }
  if (width !== undefined) return { width, height: Math.round(width / 2) }
  if (height !== undefined) return { width: height * 2, height }
  return PLACEHOLDER_SIZE
}

function pdfAttr(name: string, value: string): string {
  return pdfAttributes([[name, value]])
}
