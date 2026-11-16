import type { ReactNode } from 'react'

export interface FilterBarProps {
  /** El campo de texto: ocupa la primera fila, menos lo que tomen las acciones. */
  searchBox: ReactNode
  /** Lo que va a la derecha del buscador, como un botón de descarga o un filtro de sí o no. */
  actions?: ReactNode
  /** Los demás filtros (listas, casillas): van en una fila horizontal debajo del buscador. */
  children?: ReactNode
}
