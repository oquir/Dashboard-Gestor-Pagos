import type { DateFormatId } from '../../../../types/fieldDate'

export interface PreviewDateInputProps {
  id?: string
  ariaLabel?: string
  // Sin formato, el input del navegador; con formato, texto con mascara y calendario aparte.
  format: DateFormatId | undefined
  withTime: boolean
  // El valor interno (AAAA-MM-DD) o el texto a medio escribir.
  value: string
  min?: string
  max: string
  disabled: boolean
  // Las arma PreviewFieldControl, que sabe si el campo esta en rojo.
  className: string
  onChange: (value: string) => void
}
