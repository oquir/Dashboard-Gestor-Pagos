import type { InputHTMLAttributes } from 'react'

// code: regex, rutas. Prop y no className: dos utilidades de color las resuelve el orden de la hoja,
// no el de las clases.
export type InputTone = 'default' | 'code'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  tone?: InputTone
}
