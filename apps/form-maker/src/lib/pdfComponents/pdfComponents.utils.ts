import { PDF_CANVAS_CLASS, PDF_COMPONENT_ATTRIBUTE, PDF_VARIABLE_PATTERN } from '../../constants'
import type { CssStyleMap, PdfComponent, PdfComponentMode } from '../../types'
import { escapePdfText, pdfAttributes, pdfCssText } from '../pdfHtml'
import { LABEL_CHIP_STYLE, PLACEHOLDER_BORDER, PLACEHOLDER_STYLE } from './pdfComponents.constants'

// Piezas para escribir el HTML de los componentes, privadas a lib/pdfComponents.

// Escapado, cada salto un <br> y los espacios seguidos se conservan. En el lienzo las variables van
// resaltadas; en el archivo, tal cual para el back.
export function textHtml(text: string, mode: PdfComponentMode): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .split(PDF_VARIABLE_PATTERN)
        .map((part) =>
          mode === 'canvas' && PDF_VARIABLE_PATTERN.test(part)
            ? `<span class="${PDF_CANVAS_CLASS.variable}">${escapePdfText(part)}</span>`
            : keepSpaces(escapePdfText(part)),
        )
        .join(''),
    )
    .join('<br>')
}

function keepSpaces(html: string): string {
  return html.replace(/ {2,}/g, (run: string) => ` ${'&nbsp;'.repeat(run.length - 1)}`)
}

// Los dos atributos que dejan reabrir el componente, mas los que se le pasen.
export function componentAttributes(
  component: PdfComponent,
  extra: [string, string | null][] = [],
): string {
  return pdfAttributes([
    [PDF_COMPONENT_ATTRIBUTE.type, component.type],
    [PDF_COMPONENT_ATTRIBUTE.config, JSON.stringify(componentConfig(component))],
    ...extra,
  ])
}

// Todo menos el tipo (va en su propio atributo) y la imagen (se lee del <img>).
function componentConfig(component: PdfComponent): Record<string, unknown> {
  const config: Record<string, unknown> = { ...component }
  delete config.type
  delete config.src
  return config
}

export function element(
  name: string,
  attributes: string,
  style: CssStyleMap,
  inner: string | null,
): string {
  const opening: string = `<${name}${attributes}${pdfAttributes([['style', pdfCssText(style)]])}>`
  return inner === null ? opening : `${opening}${inner}</${name}>`
}

export function placeholder(
  attributes: string,
  width: number,
  height: number,
  label: string,
  style: CssStyleMap = {},
): string {
  const box: CssStyleMap = {
    ...PLACEHOLDER_STYLE,
    border: PLACEHOLDER_BORDER,
    width: `${width}px`,
    height: `${height}px`,
    lineHeight: `${Math.max(0, height - 2)}px`,
    ...style,
  }
  return element(
    'span',
    attributes,
    box,
    element('span', '', LABEL_CHIP_STYLE, escapePdfText(label)),
  )
}

export function sizeStyle(width: number | undefined, height: number | undefined): CssStyleMap {
  const style: CssStyleMap = {}
  if (width !== undefined) style.width = `${width}px`
  if (height !== undefined) style.height = `${height}px`
  return style
}
