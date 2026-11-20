import type { CanvasRow } from '../../types'
import type { RowDropEdge, RowDropTarget } from '../../types'
import { normalizeGroupRows } from '../repeatableGroup'

// Reordenar filas, puro. Una fila nunca entra ni sale de un grupo arrastrando (limpiaria el
// apiBinding de sus campos en silencio). Una suelta sobre una banda se pega al borde; una de un
// grupo apuntando afuera es invalida.

export function resolveRowDrop(
  rows: CanvasRow[],
  draggedRowId: string,
  hoveredRowId: string,
  edge: RowDropEdge,
): RowDropTarget | null {
  const dragged: CanvasRow | undefined = rows.find((row) => row.id === draggedRowId)
  const hovered: CanvasRow | undefined = rows.find((row) => row.id === hoveredRowId)
  if (!dragged || !hovered) return null

  // Misma pertenencia, sea la de las filas sueltas o la de un mismo grupo: se reordena libremente.
  if (dragged.groupId === hovered.groupId) {
    return { rowId: hovered.id, edge, isValid: true }
  }

  if (dragged.groupId !== undefined) {
    return { rowId: hovered.id, edge, isValid: false }
  }

  // Por la mitad de la banda: el destino es un borde del grupo, no una fila.
  const members: CanvasRow[] = rows.filter((row) => row.groupId === hovered.groupId)
  const insertAt: number = members.indexOf(hovered) + (edge === 'after' ? 1 : 0)

  return insertAt * 2 <= members.length
    ? { rowId: members[0].id, edge: 'before', isValid: true }
    : { rowId: members[members.length - 1].id, edge: 'after', isValid: true }
}

// La cabecera de una banda necesita su propio objetivo: si no, seria zona muerta justo encima del
// grupo.
export function resolveBandDrop(
  rows: CanvasRow[],
  draggedRowId: string,
  groupId: string,
  edge: RowDropEdge,
): RowDropTarget | null {
  const dragged: CanvasRow | undefined = rows.find((row) => row.id === draggedRowId)
  const members: CanvasRow[] = rows.filter((row) => row.groupId === groupId)
  if (!dragged || members.length === 0) return null

  // Sobre la cabecera de su propio grupo no hay nada que senalar.
  if (dragged.groupId === groupId) return null

  if (dragged.groupId !== undefined) {
    return { rowId: members[0].id, edge: 'before', isValid: false }
  }

  return edge === 'before'
    ? { rowId: members[0].id, edge: 'before', isValid: true }
    : { rowId: members[members.length - 1].id, edge: 'after', isValid: true }
}

export function reorderRows(
  rows: CanvasRow[],
  draggedRowId: string,
  target: RowDropTarget,
): CanvasRow[] {
  if (!target.isValid) return rows

  const from: number = rows.findIndex((row) => row.id === draggedRowId)
  const anchor: number = rows.findIndex((row) => row.id === target.rowId)
  // anchor -1 cubre tambien el arrastre entre lienzos: se rechaza solo.
  if (from === -1 || anchor === -1) return rows

  const to: number = target.edge === 'before' ? anchor : anchor + 1
  // Los dos bordes que rodean a la propia fila la dejan exactamente donde ya estaba.
  if (to === from || to === from + 1) return rows

  const next: CanvasRow[] = [...rows]
  const [moved] = next.splice(from, 1)
  // Sacar la fila corrio un puesto hacia atras todo lo que venia detras de ella.
  next.splice(to > from ? to - 1 : to, 0, moved)

  // Un borrador editado a mano puede traer filas de grupo salteadas.
  return normalizeGroupRows(next)
}
