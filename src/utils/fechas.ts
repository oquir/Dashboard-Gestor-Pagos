/** La fecha de hoy en formato ISO (AAAA-MM-DD). */
export const hoy = () => new Date().toISOString().slice(0, 10)

/** La fecha y la hora locales de este momento (AAAA-MM-DDTHH:MM). */
export const ahora = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

/** La misma fecha `anios` años después (o antes, si es negativo); el 29 de febrero pasa al 28. Vacía sigue vacía. */
export const moverAnios = (iso: string, anios: number) => iso && `${Number(iso.slice(0, 4)) + anios}${iso.slice(4)}`.replace(/-02-29$/, '-02-28')

/** Días de `desde` a `hasta`: negativo si `hasta` es anterior. */
export const diferenciaDias = (desde: string, hasta: string) =>
  Math.round((new Date(`${hasta}T12:00:00Z`).getTime() - new Date(`${desde}T12:00:00Z`).getTime()) / 86_400_000)

/** Suma meses a una fecha ISO; si el mes destino es más corto, queda en su último día (31 ene + 1 mes = 28 feb). */
export function sumarMeses(iso: string, meses: number) {
  const [a, m, d] = iso.split('-').map(Number)
  const ultimo = new Date(Date.UTC(a, m - 1 + meses + 1, 0)).getUTCDate()
  return new Date(Date.UTC(a, m - 1 + meses, Math.min(d, ultimo))).toISOString().slice(0, 10)
}
