import type { ReactNode } from 'react'

export interface PreviewAffixFrameProps {
  prefix?: string
  suffix?: string
  invalid: boolean
  // Recibe las clases del input sin borde ni fondo.
  children: (inputClassName: string) => ReactNode
}
