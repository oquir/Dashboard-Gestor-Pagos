import type { PdfImageCheck } from '../../types'

// Referencia fija: el componente compara lo que devuelve el hook en cada render.
export const NO_IMAGE_CHECK: PdfImageCheck = { status: 'none' }

// Una {Var} sola: la imagen la pone el back y aca no hay nada que cargar.
export const VARIABLE_SOURCE: RegExp = /^\{[^{}\s]+\}$/
