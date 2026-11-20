import { DEFAULT_TOOLTIP_POSITION } from '../../constants'
import { TOOLTIP_CAPABLE_FIELD_TYPES } from '../../constants'
import type { ExportedTooltip } from '../../types'
import type { CanvasField, FieldTooltip } from '../../types'
import { resolveTooltipStyles } from '../cssStyles'
import { emptyRichText, isEmptyRichText } from '../richText'

// Ayuda contextual de un campo (ocho tipos). Contenido RichTextContent, como rich_text. Activado
// pero vacio no se exporta.

export function supportsTooltip(type: string): boolean {
  return TOOLTIP_CAPABLE_FIELD_TYPES.includes(type)
}

export function hasTooltip(field: CanvasField): boolean {
  return supportsTooltip(field.type) && !isEmptyRichText(field.tooltip?.content)
}

export function exportableTooltip(field: CanvasField): ExportedTooltip | undefined {
  if (!hasTooltip(field) || !field.tooltip) return undefined

  return {
    content: field.tooltip.content,
    position: field.tooltip.position,
    styles: resolveTooltipStyles(field.tooltip),
  }
}

export function createEmptyTooltip(): FieldTooltip {
  return { content: emptyRichText(), position: DEFAULT_TOOLTIP_POSITION }
}
