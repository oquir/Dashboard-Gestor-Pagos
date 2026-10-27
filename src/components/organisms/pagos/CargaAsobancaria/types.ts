export interface Resultado {
  archivo: string
  /** La del encabezado del archivo; undefined si no la trae. */
  fecha?: string
  pagos: number
  totales: number
  valor: number
  sinCruce: number
}
