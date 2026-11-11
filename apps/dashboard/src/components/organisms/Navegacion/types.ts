import type { IconComponent } from 'reicon-react'
import type { Permiso } from '../../../lib/permisos'

export interface EnlaceNavegacion {
  a: string
  texto: string
  icono: IconComponent
  permiso?: Permiso
}

export interface NavegacionProps {
  alElegir?: () => void
}
