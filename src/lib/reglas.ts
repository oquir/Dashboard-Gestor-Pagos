// Reglas del dominio que usa el dashboard (ver docs/Dominio-ICA.md, secciones 5 y 6).
import type { ConfigMunicipio, Declaracion, EstadoPago, Pago, Sector } from '../types'

/** UVT 2026 (dato que caduca, sección 7 del dominio). */
export const UVT = 52374

/** Topes de ley: el municipio solo puede bajarlos (art. 59, Ley 788 de 2002). */
export const SANCIONES_LEY: ConfigMunicipio['sanciones'] = {
  extemporaneidad: 5,
  extemporaneidadEmplazamiento: 10,
  correccion: 10,
  correccionEmplazamiento: 20,
  minimaUvt: 10,
}

export const ANTICIPO_MAXIMO = 40

/** Rango de tarifas por mil; el sector financiero tiene reglas propias. */
export const TOPES_TARIFA: Record<Exclude<Sector, 'financiero'>, [number, number]> = {
  industrial: [2, 7],
  comercial: [2, 10],
  servicios: [2, 10],
}

export function totalPagado(declaracionId: string, pagos: Pago[]) {
  return pagos.filter((p) => p.declaracionId === declaracionId).reduce((suma, p) => suma + p.valor, 0)
}

/**
 * ICA anual admite pago parcial y saldo a favor; ReteICA y autorretención
 * sin pago total son ineficaces y no producen saldo a favor.
 */
export function estadoPago(declaracion: Declaracion, pagos: Pago[]): EstadoPago {
  const pagado = totalPagado(declaracion.id, pagos)
  if (declaracion.impuesto === 'ica') {
    if (declaracion.totalAPagar === 0) return declaracion.saldoAFavor > 0 ? 'saldo_a_favor' : 'pagada'
    if (pagado >= declaracion.totalAPagar) return 'pagada'
    return pagado > 0 ? 'parcial' : 'sin_pago'
  }
  return pagado >= declaracion.totalAPagar ? 'pagada' : 'ineficaz'
}

export const redondearMil = (valor: number) => Math.round(valor / 1000) * 1000

/** Renglones de subtotal y total de la liquidación (se resaltan en pantalla y en el PDF). */
export const RENGLONES_TOTALES = new Set(['16', '25', '33', '34', '38', '18', 'T'])
