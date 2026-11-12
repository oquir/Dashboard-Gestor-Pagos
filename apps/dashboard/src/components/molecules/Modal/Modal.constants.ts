import type { ModalProps } from './Modal.types'

/** `full` ocupa toda la ventana del navegador; las otras dejan un margen y se centran. */
export const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  md: 'm-auto w-[calc(100%-2rem)] max-w-lg rounded-xl',
  xl: 'm-auto w-[calc(100%-2rem)] max-w-6xl rounded-xl',
  full: 'm-0 h-dvh max-h-none w-screen max-w-none rounded-none',
}

/** Botón de ícono de la cabecera, como la X de cerrar. */
export const MODAL_ICON_BUTTON_CLASS =
  'rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
