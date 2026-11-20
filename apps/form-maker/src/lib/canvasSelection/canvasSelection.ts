import type { SelectionRect } from '../../types'

// Aritmetica pura de la seleccion multiple: el rectangulo del marco y los conjuntos de ids.

export function normalizeRect(x1: number, y1: number, x2: number, y2: number): SelectionRect {
  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    right: Math.max(x1, x2),
    bottom: Math.max(y1, y2),
  }
}

// Tocar alcanza, como en Figma.
export function rectsIntersect(a: SelectionRect, b: SelectionRect): boolean {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top
}

export function pointInRect(x: number, y: number, rect: SelectionRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

// Por contenido: el marco arma un arreglo nuevo en cada movimiento, que no tiene por que llegar al
// store.
export function sameIdSet(a: string[], b: string[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false

  const ids = new Set<string>(a)

  return b.every((id) => ids.has(id))
}

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]
}

// Lo que ya estaba primero y lo nuevo despues, sin repetir.
export function mergeIds(base: string[], extra: string[]): string[] {
  const seen = new Set<string>(base)
  const merged: string[] = [...base]

  for (const id of extra) {
    if (seen.has(id)) continue
    seen.add(id)
    merged.push(id)
  }

  return merged
}

// Misma referencia si no hay nada que quitar: el store compara por identidad.
export function withoutIds(ids: string[], removed: ReadonlySet<string>): string[] {
  return ids.some((id) => removed.has(id)) ? ids.filter((id) => !removed.has(id)) : ids
}
