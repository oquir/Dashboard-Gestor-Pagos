import { hoy } from '../../../utils'
import { Input } from '../../atoms'
import Campo from '../Campo'
import type { RangoFechasProps } from './types'

/** Fechas desde y hasta, sin pasar de hoy. */
export default function RangoFechas({ desde, hasta, cambiarDesde, cambiarHasta }: RangoFechasProps) {
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
