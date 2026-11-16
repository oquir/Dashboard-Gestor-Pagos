// Azar con semilla para los datos de la demo: con la misma semilla siempre salen los mismos valores.

export function createRandom(seed: number) {
  let s = seed >>> 0
  const num = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    num,
    integer: (min: number, max: number) => min + Math.floor(num() * (max - min + 1)),
    pick: <T>(list: T[]) => list[Math.floor(num() * list.length)],
    prob: (p: number) => num() < p,
  }
}
export type Random = ReturnType<typeof createRandom>

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export const randomDate = (az: Random, from: string, to: string) =>
  addDays(from, az.integer(0, Math.round((Date.parse(to) - Date.parse(from)) / 86400000)))
