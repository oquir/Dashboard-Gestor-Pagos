// Azar con semilla para los datos de la demo: con la misma semilla siempre salen los mismos valores.

export function crearAzar(semilla: number) {
  let s = semilla >>> 0
  const num = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    num,
    entero: (min: number, max: number) => min + Math.floor(num() * (max - min + 1)),
    elegir: <T>(lista: T[]) => lista[Math.floor(num() * lista.length)],
    prob: (p: number) => num() < p,
  }
}
export type Azar = ReturnType<typeof crearAzar>

export function sumarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

export const fechaAleatoria = (az: Azar, desde: string, hasta: string) =>
  sumarDias(desde, az.entero(0, Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000)))
