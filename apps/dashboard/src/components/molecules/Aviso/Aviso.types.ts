import type { IconComponent } from 'reicon-react'
import type { ReactNode } from 'react'
import type { Tono } from '../../../lib/tonos'

export interface AvisoProps {
  tono: Tono
  icono?: IconComponent
  /** `status` para resultados; `alert` para errores que hay que atender. */
  rol?: 'status' | 'alert'
  children: ReactNode
}
