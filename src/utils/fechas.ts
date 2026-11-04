/** La fecha de hoy en formato ISO (AAAA-MM-DD). */
export const hoy = () => new Date().toISOString().slice(0, 10)

/** La misma fecha `anios` años después (o antes, si es negativo); el 29 de febrero pasa al 28. Vacía sigue vacía. */
export const moverAnios = (iso: string, anios: number) => iso && `${Number(iso.slice(0, 4)) + anios}${iso.slice(4)}`.replace(/-02-29$/, '-02-28')

/** Días de `desde` a `hasta`: negativo si `hasta` es anterior. */
export const diferenciaDias = (desde: string, hasta: string) =>
  Math.round((new Date(`${hasta}T12:00:00Z`).getTime() - new Date(`${desde}T12:00:00Z`).getTime()) / 86_400_000)
