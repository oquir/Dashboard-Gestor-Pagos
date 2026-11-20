// Vacio borra la regla (hereda de la base), no la guarda como 0.
export function toNumberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === '') return undefined

  const parsed: number = Number(raw)

  return Number.isNaN(parsed) ? undefined : parsed
}
