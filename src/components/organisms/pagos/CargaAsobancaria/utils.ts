import type { Resultado } from './types'

/** Resultado de prueba: en la demo del archivo solo se lee la fecha; el cruce se simula. */
export function simular(archivo: string, fecha: string | undefined): Resultado {
  const pagos = 4 + Math.floor(Math.random() * 15)
  return {
    archivo,
    fecha,
    pagos,
    totales: pagos - Math.floor(Math.random() * (pagos / 3)),
    valor: (20 + Math.floor(Math.random() * 400)) * 100_000,
    sinCruce: Math.floor(Math.random() * 3),
  }
}
