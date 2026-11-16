import type { Rate } from './domain'

/** Tarifas leídas del Excel que aún no se han confirmado. */
export interface Preview {
  file: string
  rates: Rate[]
}
