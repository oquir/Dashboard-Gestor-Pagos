import type { Tarifa } from './dominio'

/** Tarifas leídas del Excel que aún no se han confirmado. */
export interface VistaPrevia {
  archivo: string
  tarifas: Tarifa[]
}
