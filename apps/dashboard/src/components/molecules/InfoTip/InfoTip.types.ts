import type { Placement } from '@floating-ui/react'
import type { ReactNode } from 'react'

export interface InfoTipProps {
  /** Lo que se está explicando; da el nombre accesible del botón. */
  label: string
  /** La explicación que sale en el globo. */
  content: ReactNode
  /** Dónde sale si cabe; si no, se voltea solo. */
  placement?: Placement
  /** Clases del globo; por defecto un ancho fijo para que el texto largo no se estire. */
  className?: string
}
