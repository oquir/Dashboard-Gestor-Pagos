import type { Declaracion } from '../../../../types'

export interface EmplazamientosDeclaracionProps {
  d: Declaracion
  /**
   * Si el usuario puede registrar un emplazamiento para corregir en esta declaración: tiene el permiso y la declaración
   * está vigente (no la reemplazó una corrección, no es una solicitud sin aceptar ni se rechazó en la aprobación previa).
   */
  puedeRegistrar: boolean
}
