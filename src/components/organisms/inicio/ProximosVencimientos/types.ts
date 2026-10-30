export interface VencimientoProximo {
  id: string
  impuesto: string
  periodoTexto: string
  fecha: string
  decreto?: string
  diasRestantes: number
}

export interface ProximosVencimientosProps {
  className?: string
  municipioId: string | null
}
