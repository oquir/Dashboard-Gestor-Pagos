import { getCanvasScrollPort } from '../../lib'

// :hover lo resuelve el navegador con la ultima posicion conocida del puntero. El puerto es el <main>
// del diseñador (lleva data-canvas-scroll), asi que Espacio solo es la mano con el puntero sobre las
// hojas: con el foco en un boton de la barra lateral tiene que seguir activandolo.
export function isPointerOverCanvas(): boolean {
  return getCanvasScrollPort()?.matches(':hover') ?? false
}

// Un input, un textarea, un select o algo contentEditable: ahi las teclas son del texto.
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
