export interface RangoFechasProps {
  desde: string
  hasta: string
  cambiarDesde: (fecha: string) => void
  cambiarHasta: (fecha: string) => void
}
