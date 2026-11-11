import type { Check, Declaration, PaymentStatus, Payment } from './domain'

/** Declaración con deuda, para las listas de Inicio. */
export interface Debt {
  d: Declaration
  status: PaymentStatus
  paidAmount: number
}

/** Fila de la cartera pendiente. */
export interface ReceivablesRow {
  d: Declaration
  status: PaymentStatus
  paidAmount: number
  name: string
}

/** Fila de los pagos recibidos. */
export interface PaymentRow {
  p: Payment
  d: Declaration
  name: string
}

/**
 * ReteICA o AutoReteICA con saldo: lo retenido o autorretenido que no ha llegado al municipio. Si no se consigna dentro
 * de los 2 meses siguientes al vencimiento, puede ser delito (art. 402 del Código Penal).
 */
export interface UnremittedWithholding {
  d: Declaration
  /** Lo que falta consignar. No cuenta lo que está en cheques en canje: eso ya se entregó y el banco lo está cobrando. */
  balance: number
  /** Último día para consignar: 2 meses después del vencimiento. */
  limit: string
  /** Días que faltan para el límite: 0 si es hoy, negativo si ya pasó. */
  days: number
}

/** Fila de las retenciones sin consignar en Pagos. */
export interface UnremittedRow extends UnremittedWithholding {
  name: string
}

/** Medios que el municipio recibe en su ventanilla para un formulario. */
export interface TellerMethods {
  cash: boolean
  check: boolean
}

/** Fila de los cheques en canje. */
export interface CheckRow {
  c: Check
  d: Declaration
  name: string
}
