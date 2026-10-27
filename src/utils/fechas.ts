/** La fecha de hoy en formato ISO (AAAA-MM-DD). */
export const hoy = () => new Date().toISOString().slice(0, 10)
