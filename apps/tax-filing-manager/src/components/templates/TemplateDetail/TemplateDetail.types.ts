import type { ReactNode } from 'react'

export interface TemplateDetailProps {
  goBack: { a: string; text: string }
  title: string
  description?: string
  actions?: ReactNode
  /** A todo el ancho, entre el encabezado y las columnas. */
  notice?: ReactNode
  main: ReactNode
  side: ReactNode
  /** Para llevar la vista a la columna ancha, que en pantallas angostas queda arriba de la lateral. */
  mainId?: string
}
