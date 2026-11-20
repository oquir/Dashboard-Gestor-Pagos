// Consultas al DOM del lienzo compartidas entre carpetas. Los atributos data-* son el contrato. Sin
// React ni store.

export function getCanvasScrollPort(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-canvas-scroll]')
}

export function getRowElement(rowId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-row-id="${rowId}"]`)
}

export function getBandElement(groupId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-band-id="${groupId}"]`)
}

export function getFieldElement(fieldId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-field-id="${fieldId}"]`)
}

// Solo hay un paso montado: no hace falta acotar.
export function getFieldElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-field-id]'))
}
