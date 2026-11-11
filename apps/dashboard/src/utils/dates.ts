/** La fecha de hoy en formato ISO (AAAA-MM-DD). */
export const today = () => new Date().toISOString().slice(0, 10)

/** La fecha y la hora locales de este momento (AAAA-MM-DDTHH:MM). */
export const now = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

/** La misma fecha `anios` años después (o antes, si es negativo); el 29 de febrero pasa al 28. Vacía sigue vacía. */
export const shiftYears = (iso: string, years: number) =>
  iso && `${Number(iso.slice(0, 4)) + years}${iso.slice(4)}`.replace(/-02-29$/, '-02-28')

/** Días de `desde` a `hasta`: negativo si `hasta` es anterior. */
export const dayDifference = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86_400_000,
  )

/** Suma meses a una fecha ISO; si el mes destino es más corto, queda en su último día (31 ene + 1 mes = 28 feb). */
export function addMonths(iso: string, months: number) {
  const [a, m, d] = iso.split('-').map(Number)
  const last = new Date(Date.UTC(a, m - 1 + months + 1, 0)).getUTCDate()
  return new Date(Date.UTC(a, m - 1 + months, Math.min(d, last))).toISOString().slice(0, 10)
}
