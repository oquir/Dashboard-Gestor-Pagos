import type { Cheque, Declaracion, EstadoPago, Pago } from './dominio'

/** Declaración con deuda, para las listas de Inicio. */
export interface Deuda {
  d: Declaracion
  estado: EstadoPago
  pagado: number
}

/** Fila de la cartera pendiente. */
export interface FilaCartera {
  d: Declaracion
  estado: EstadoPago
  pagado: number
  nombre: string
}

/** Fila de los pagos recibidos. */
export interface FilaPago {
  p: Pago
  d: Declaracion
  nombre: string
}

/**
 * ReteICA o AutoReteICA con saldo: lo retenido o autorretenido que no ha llegado al municipio. Si no se consigna dentro
 * de los 2 meses siguientes al vencimiento, puede ser delito (art. 402 del Código Penal).
 */
export interface RetencionSinConsignar {
  d: Declaracion
  /** Lo que falta consignar. No cuenta lo que está en cheques en canje: eso ya se entregó y el banco lo está cobrando. */
  saldo: number
  /** Último día para consignar: 2 meses después del vencimiento. */
  limite: string
  /** Días que faltan para el límite: 0 si es hoy, negativo si ya pasó. */
  dias: number
}

/** Fila de las retenciones sin consignar en Pagos. */
export interface FilaSinConsignar extends RetencionSinConsignar {
  nombre: string
}

/** Medios que el municipio recibe en su ventanilla para un formulario. */
export interface MediosVentanilla {
  efectivo: boolean
  cheque: boolean
}

/** Fila de los cheques en canje. */
export interface FilaCheque {
  c: Cheque
  d: Declaracion
  nombre: string
}
