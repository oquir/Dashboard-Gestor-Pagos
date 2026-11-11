import type { Result } from './AsobancariaUpload.types'

/** Resultado de prueba: en la demo del archivo solo se lee la fecha; el cruce se simula. */
export function simulate(file: string, date: string | undefined): Result {
  const payments = 4 + Math.floor(Math.random() * 15)
  return {
    file,
    date,
    payments,
    totals: payments - Math.floor(Math.random() * (payments / 3)),
    value: (20 + Math.floor(Math.random() * 400)) * 100_000,
    withoutCrossCheck: Math.floor(Math.random() * 3),
  }
}
