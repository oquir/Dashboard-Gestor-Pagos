import type { Placement } from '@floating-ui/react'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipProps {
  // Lo que dice el globo.
  content: ReactNode
  // Un solo elemento que reciba foco (boton, enlace o con tabIndex), para que el teclado tambien lo abra.
  children: ReactElement<Record<string, unknown>>
  // Donde sale si cabe; si no, se voltea solo.
  placement?: Placement
  // Clases extra del globo, por ejemplo un ancho fijo.
  className?: string
  // En true el globo no sale y el elemento se pinta igual: el panel abierto ya muestra el texto.
  disabled?: boolean
}
