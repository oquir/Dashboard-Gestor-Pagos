import type { ReactNode } from 'react'

export interface PlantillaDetalleProps {
  volver: { a: string; texto: string }
  titulo: string
  descripcion?: string
  acciones?: ReactNode
  /** A todo el ancho, entre el encabezado y las columnas. */
  aviso?: ReactNode
  principal: ReactNode
  lateral: ReactNode
  /** Para llevar la vista a la columna ancha, que en pantallas angostas queda arriba de la lateral. */
  idPrincipal?: string
}
