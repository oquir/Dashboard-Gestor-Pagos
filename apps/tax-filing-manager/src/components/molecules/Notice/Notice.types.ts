import type { IconComponent } from 'reicon-react'
import type { ReactNode } from 'react'
import type { Tone } from '../../../lib'

export interface NoticeProps {
  tone: Tone
  icon?: IconComponent
  /** `status` para resultados; `alert` para errores que hay que atender. */
  role?: 'status' | 'alert'
  children: ReactNode
}
