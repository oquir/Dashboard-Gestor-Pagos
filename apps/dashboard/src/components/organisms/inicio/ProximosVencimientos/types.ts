export interface VencimientoProximo {
  id: string
  impuesto: string
  periodoTexto: string
  /** Primera fecha límite del periodo. */
  fecha: string
  /** Última fecha, si cambia según el último dígito del NIT o la cédula. */
  hasta?: string
  decreto?: string
  /** Días hasta la primera fecha. */
  diasRestantes: number
  /** Días hasta la última fecha (la misma que la primera si no cambia por dígito). */
  diasHasta: number
}

export interface ProximosVencimientosProps {
  className?: string
  municipioId: string | null
}
