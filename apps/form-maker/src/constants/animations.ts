// Las animaciones de entrada (al montar), armadas con tw-animate-css. Por que existen y sus reglas:
// docs/Decisiones.md, "Low-performance mode". El modo de bajo rendimiento las apaga con la regla
// global de index.css, como a cualquier animacion CSS.
//
// TRAMPA: en filas y bandas no van duration-*, delay-* ni ease-*. Esas clases tambien tocan
// transition-duration/-delay/-timing-function, y esos elementos tienen transiciones propias (el
// color del borde, el desplazamiento al arrastrar con su ease de rebote): un delay de 420ms
// retrasaria el hover. Ahi se usa animation-duration-* y la variable --tw-animation-delay, que es la
// que lee el shorthand de animate-in. El contenedor del campo no tiene transiciones: el si lleva ease.

export const ENTER_FADE_CLASSES: string =
  'animate-in fade-in animation-duration-160 ease-out motion-reduce:animate-none'

export const ENTER_MODAL_CLASSES: string =
  'animate-in fade-in zoom-in-96 slide-in-from-bottom-2 animation-duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none'

export const ENTER_POP_CLASSES: string =
  'animate-in fade-in zoom-in-95 animation-duration-140 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none'

export const ENTER_RISE_CLASSES: string =
  'animate-in fade-in slide-in-from-bottom-[6px] animation-duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none'

// Escalonada por --enter-index (indice del bloque en el lienzo), con tope en 12. `backwards`
// esconde la fila durante su retardo y no deja nada despues.
export const ENTER_ROW_CLASSES: string =
  'animate-in fade-in slide-in-from-bottom-[10px] animation-duration-260 fill-mode-backwards [--tw-animation-delay:calc(min(var(--enter-index,0),12)*35ms)] motion-reduce:animate-none'

export const ENTER_FIELD_CLASSES: string =
  'animate-in fade-in zoom-in-90 animation-duration-240 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:animate-none'

export const ENTER_STEP_FORWARD_CLASSES: string =
  'animate-in fade-in slide-in-from-right-4 animation-duration-240 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none'

export const ENTER_STEP_BACK_CLASSES: string =
  'animate-in fade-in slide-in-from-left-4 animation-duration-240 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none'

export const ENTER_CHECK_CLASSES: string =
  'animate-in fade-in zoom-in-40 animation-duration-260 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:animate-none'
