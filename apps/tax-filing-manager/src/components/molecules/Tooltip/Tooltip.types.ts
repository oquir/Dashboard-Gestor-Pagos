import type { Placement } from '@floating-ui/react'
import type { ReactElement, ReactNode } from 'react'

export interface TooltipProps {
  /** Lo que dice el globo. */
  content: ReactNode
  /** Un solo elemento que reciba foco (botón, enlace o con tabIndex), para que el teclado también lo abra. */
  children: ReactElement<Record<string, unknown>>
  /** Dónde sale si cabe; si no, se voltea solo. */
  placement?: Placement
  /** Clases extra del globo, por ejemplo un ancho fijo. */
  className?: string
  /** Si está en true, el globo no sale; el elemento se pinta igual. Por ejemplo, el menú extendido ya muestra el texto. */
  disabled?: boolean
}
