import { Input } from '../atoms'
import Campo from './Campo'

const hoy = () => new Date().toISOString().slice(0, 10)

/** Fechas desde y hasta, sin pasar de hoy. */
export default function RangoFechas({ desde, hasta, cambiarDesde, cambiarHasta }: {
  desde: string
  hasta: string
  cambiarDesde: (fecha: string) => void
  cambiarHasta: (fecha: string) => void
}) {
  return (
    <>
      <Campo etiqueta="Desde" error={desde > hasta ? 'Debe ser anterior a la fecha final.' : undefined}>
        <Input type="date" max={hasta || hoy()} value={desde} onChange={(e) => cambiarDesde(e.target.value)} />
      </Campo>
      <Campo etiqueta="Hasta">
        <Input type="date" min={desde} max={hoy()} value={hasta} onChange={(e) => cambiarHasta(e.target.value)} />
      </Campo>
    </>
  )
}
