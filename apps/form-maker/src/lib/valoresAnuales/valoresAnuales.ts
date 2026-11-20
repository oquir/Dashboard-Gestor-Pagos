import type { ValorAnual } from '../../types/valores'

// Busqueda pura por ano; guarda lib/valoresBank y la expone lib/scriptValores.

export function buscarValores(valores: ValorAnual[], anio: number): ValorAnual | null {
  if (!Number.isFinite(anio) || anio <= 0) return null

  return valores.find((valor) => valor.anio === anio) ?? null
}

// 0 y no NaN si el texto no sirve: no encuentra fila y es "no hay dato".
export function anioDeTexto(fecha: string): number {
  const anio: number = Number.parseInt(fecha.slice(0, 4), 10)

  return Number.isFinite(anio) && anio > 0 ? anio : 0
}
