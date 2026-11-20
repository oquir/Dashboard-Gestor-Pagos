import type { RowDisplacement } from './CanvasRowsGrid.types'

// Referencia estable: mapas nuevos redibujarian todas las filas.
export const NO_DISPLACEMENT: RowDisplacement = { rows: new Map(), bands: new Map() }
