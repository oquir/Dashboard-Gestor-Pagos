import { isPresentationalField } from '../../../../lib'
import type { CanvasField, CatalogFill } from '../../../../types'

// Cualquier campo con valor del mismo lienzo menos el origen. Sin filtrar por tipo ni por elegidos:
// la lista no cambia bajo el mouse.
export function fillTargetCandidates(fields: CanvasField[], sourceId: string): CanvasField[] {
  return fields.filter(
    (candidate) => candidate.id !== sourceId && !isPresentationalField(candidate.type),
  )
}

export function replaceFill(fills: CatalogFill[], index: number, next: CatalogFill): CatalogFill[] {
  return fills.map((fill, position) => (position === index ? next : fill))
}

export function removeFill(fills: CatalogFill[], index: number): CatalogFill[] {
  return fills.filter((_, position) => position !== index)
}
