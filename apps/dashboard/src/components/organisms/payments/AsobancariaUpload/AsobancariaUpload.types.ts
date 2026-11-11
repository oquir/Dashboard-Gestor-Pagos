export interface Result {
  file: string
  /** La del encabezado del archivo; undefined si no la trae. */
  date?: string
  payments: number
  totals: number
  value: number
  withoutCrossCheck: number
}
