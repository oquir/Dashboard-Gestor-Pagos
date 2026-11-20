import type { CssStyleMap, FieldStyles, FieldTooltip } from '../../types'
import type { RowStyles } from '../../types'
import { splitDeclarations, toCamelCase } from './cssStyles.utils'

// CSS escrito a mano (el modelo) a objeto plano para el style de React (el contrato). Reemplaza a
// Tailwind, que en el consumidor solo funcionaba por casualidad. Sin saneado: style no ejecuta
// nada.

// Corta en el primer ":" a proposito: url(http://x.png) tiene los suyos.
export function parseCssText(text: string): CssStyleMap {
  const result: CssStyleMap = {}

  for (const declaration of splitDeclarations(text)) {
    const separatorIndex: number = declaration.indexOf(':')
    if (separatorIndex <= 0) continue

    const property: string = declaration.slice(0, separatorIndex).trim()
    const value: string = declaration.slice(separatorIndex + 1).trim()
    if (!property || !value) continue

    result[toCamelCase(property)] = value
  }

  return result
}

// El texto libre gana (cascada normal): el lienzo pinta como el consumidor. Se aplica a la caja
// pintada, nunca a la que lleva gridColumn.
export function resolveFieldStyles(styles: FieldStyles): CssStyleMap {
  const merged: CssStyleMap = {}

  if (styles.marginTop) merged.marginTop = styles.marginTop
  if (styles.marginBottom) merged.marginBottom = styles.marginBottom
  if (styles.backgroundColor) merged.backgroundColor = styles.backgroundColor
  if (styles.textColor) merged.color = styles.textColor

  return { ...merged, ...parseCssText(styles.customCss ?? '') }
}

// undefined si no hay nada: la fila sigue sin clave styles en el JSON.
export function resolveRowStyles(styles: RowStyles | undefined): CssStyleMap | undefined {
  if (!styles) return undefined

  const merged: CssStyleMap = {}
  if (styles.marginTop) merged.marginTop = styles.marginTop
  if (styles.marginBottom) merged.marginBottom = styles.marginBottom

  const resolved: CssStyleMap = { ...merged, ...parseCssText(styles.customCss ?? '') }

  return Object.keys(resolved).length > 0 ? resolved : undefined
}

export function resolveTooltipStyles(tooltip: FieldTooltip): CssStyleMap {
  return parseCssText(tooltip.customCss ?? '')
}

// Para avisar sin bloquear: puede funcionar en el navegador del consumidor. La guarda es porque
// CSS.supports no existe en tsx.
export function unsupportedDeclarations(text: string): string[] {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return []

  const unsupported: string[] = []

  for (const declaration of splitDeclarations(text)) {
    const separatorIndex: number = declaration.indexOf(':')
    if (separatorIndex <= 0) continue

    const property: string = declaration.slice(0, separatorIndex).trim()
    const value: string = declaration.slice(separatorIndex + 1).trim()
    if (!property || !value) continue

    if (!CSS.supports(property, value)) unsupported.push(declaration)
  }

  return unsupported
}
