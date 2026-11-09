// ReteICA y AutoReteICA sin consignar: lo retenido que no ha llegado al municipio (docs/Pendientes-y-decisiones.md, §3.15).
import type { Cheque, Declaracion, Pago, RetencionSinConsignar } from '../types'
import { diferenciaDias } from '../utils'
import type { SituacionAprobacion, SituacionCorreccion } from './reglas'
import { correccionVigente, limiteConsignacion, reemplazadas as calcularReemplazadas, sePuedePagar, totalEnCanje, totalPagado } from './reglas'

interface Fuente {
  declaraciones: Declaracion[]
  pagos: Pago[]
  cheques: Cheque[]
  aprobacion: (d: Declaracion) => SituacionAprobacion | undefined
  correccion: (d: Declaracion) => SituacionCorreccion | undefined
}

/**
 * ReteICA y AutoReteICA vigentes que tienen saldo, del límite más antiguo al más próximo. No cuentan las reemplazadas
 * por una corrección, las solicitudes de corrección que no se han aceptado, las que esperan la aprobación previa (el
 * agente aún no puede pagar) ni lo que está en cheques en canje. El plazo de 2 meses del art. 402 del Código Penal corre
 * desde el vencimiento, aunque se haya presentado tarde.
 */
export function calcularSinConsignar({ declaraciones, pagos, cheques, aprobacion, correccion }: Fuente, hoy: string): RetencionSinConsignar[] {
  const reemplazadas = calcularReemplazadas(declaraciones, correccion)
  return declaraciones
    .flatMap((d) => {
      if (d.impuesto === 'ica' || reemplazadas.has(d.id) || !correccionVigente(correccion(d)) || !sePuedePagar(aprobacion(d))) return []
      const saldo = d.totalAPagar - totalPagado(d.id, pagos) - totalEnCanje(d.id, cheques)
      if (saldo <= 0) return []
      const limite = limiteConsignacion(d.fechaVencimiento)
      return [{ d, saldo, limite, dias: diferenciaDias(hoy, limite) }]
    })
    .sort((a, b) => a.limite.localeCompare(b.limite))
}
