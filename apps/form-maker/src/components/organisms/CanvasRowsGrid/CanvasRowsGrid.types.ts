import type { CanvasRow as CanvasRowData, RepeatableGroup } from '../../../types'

export interface CanvasRowsGridProps {
  rows: CanvasRowData[]
  groups?: RepeatableGroup[]
  onFieldContextMenu: (fieldId: string, x: number, y: number) => void
}

export type CanvasBlock =
  { kind: 'row'; row: CanvasRowData } | { kind: 'group'; groupId: string; rows: CanvasRowData[] }

// Una banda se mueve entera; dentro de un grupo, fila por fila.
export interface RowDisplacement {
  rows: Map<string, number>
  bands: Map<string, number>
}
