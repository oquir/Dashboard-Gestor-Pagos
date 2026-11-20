import { PDF_VARIABLE_PATTERN } from '../../constants'
import { pdfHtmlAttribute } from '../pdfHtml'
import type { PdfHtmlElement, PdfHtmlNode } from '../../types'
import {
  BODY_SELECTOR,
  MESSAGES,
  PRINT_MEDIA,
  VARIABLE_GLOBAL,
  VERSION_IN_NAME,
} from './pdfFile.constants'

// Piezas privadas de lib/pdfFile; atributos y CSS viven en lib/pdfHtml (tambien los usan los
// componentes).
export { pdfAttributes as attrs, pdfCssText as cssText } from '../pdfHtml'

// Dos decimales bastan: los px que salen de mm traen colas como 37.78544…
export function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`
}

export function elementChildren(node: PdfHtmlElement): PdfHtmlElement[] {
  return node.children.filter((child): child is PdfHtmlElement => child.type === 'element')
}

export function hasAttribute(node: PdfHtmlNode, name: string): boolean {
  return pdfHtmlAttribute(node, name) !== null
}

// Busca en profundidad, en orden de documento.
export function findElement(
  nodes: PdfHtmlNode[],
  matches: (element: PdfHtmlElement) => boolean,
): PdfHtmlElement | null {
  for (const node of nodes) {
    if (node.type !== 'element') continue
    if (matches(node)) return node
    const inner: PdfHtmlElement | null = findElement(node.children, matches)
    if (inner) return inner
  }
  return null
}

export function isBlank(nodes: PdfHtmlNode[]): boolean {
  return nodes.every((node) => node.type === 'text' && node.text.trim() === '')
}

export function positiveInt(value: string | null): number | null {
  if (value === null || !/^\s*\d+\s*$/.test(value)) return null
  const parsed: number = Number(value)
  return parsed > 0 ? parsed : null
}

// El px de una propiedad en un style que escribio el generador ("width: 120px").
export function pxFromStyle(
  style: string | null,
  property: 'width' | 'height',
): number | undefined {
  if (!style) return undefined
  const match: RegExpExecArray | null = new RegExp(
    `(?:^|;)\\s*${property}\\s*:\\s*([\\d.]+)px`,
    'i',
  ).exec(style)
  const value: number = match ? Number(match[1]) : NaN
  return Number.isFinite(value) && value > 0 ? value : undefined
}

export function versionFromFileName(name: string): number | null {
  const match: RegExpExecArray | null = VERSION_IN_NAME.exec(name)
  return match ? positiveInt(match[1]) : null
}

export function safeJson(value: string | null): Record<string, unknown> {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

// Lo que conviene revisar de una plantilla hecha a mano. No cambia nada: solo lo cuenta.
export function legacyWarnings(nodes: PdfHtmlNode[]): string[] {
  const looseText: Set<string> = new Set()
  const variableAttributes: Set<string> = new Set()
  let hasBodyStyle: boolean = false
  let hasPage: boolean = false
  let hasLooseDollar: boolean = false

  const visit = (list: PdfHtmlNode[], parent: string): void => {
    for (const node of list) {
      if (node.type === 'text') {
        if (parent === 'style') {
          // El convertidor no ve @media print: 17 de 22 plantillas traen ahi un body verde de
          // pruebas.
          if (BODY_SELECTOR.test(node.text.replace(PRINT_MEDIA, ''))) hasBodyStyle = true
          if (/@page\b/i.test(node.text)) hasPage = true
          continue
        }
        if (node.text.includes('${')) hasLooseDollar = true
        if (TABLE_ROWS.has(parent) && node.text.trim() !== '') {
          const variables: string[] = node.text.match(VARIABLE_GLOBAL) ?? [node.text.trim()]
          for (const variable of variables) looseText.add(variable.slice(0, 40))
        }
        continue
      }
      for (const [name, value] of node.attributes) {
        if (name === 'src' || name === 'href' || name.startsWith('data-fm-')) continue
        if (PDF_VARIABLE_PATTERN.test(value)) variableAttributes.add(`${name}="${value}"`)
      }
      visit(node.children, node.name)
    }
  }
  visit(nodes, '#root')

  const warnings: string[] = []
  if (looseText.size > 0) {
    warnings.push(
      `Texto suelto entre las filas de una tabla: ${list(looseText)}. Así arma filas el back del ICA; en el lienzo sale encima de la tabla.`,
    )
  }
  if (variableAttributes.size > 0) {
    warnings.push(
      `Atributos con variable: ${list(variableAttributes)}. El lienzo no los puede pintar como el back.`,
    )
  }
  if (hasBodyStyle) warnings.push(MESSAGES.bodyStyle)
  if (hasPage) warnings.push(MESSAGES.page)
  if (hasLooseDollar) warnings.push(MESSAGES.looseDollar)
  return warnings
}

// Las {Var} distintas, en orden de aparicion, del texto y de los atributos.
export function collectVariables(html: string): string[] {
  return [...new Set(html.match(VARIABLE_GLOBAL) ?? [])]
}

export function list(items: Iterable<string>, max: number = 6): string {
  const all: string[] = [...items]
  const shown: string = all.slice(0, max).join(', ')
  return all.length > max ? `${shown} y ${all.length - max} más` : shown
}

const TABLE_ROWS: ReadonlySet<string> = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])
