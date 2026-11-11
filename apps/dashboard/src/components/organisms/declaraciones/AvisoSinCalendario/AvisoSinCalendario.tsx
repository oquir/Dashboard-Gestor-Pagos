import { Calendar } from 'reicon-react'
import { formatoFecha } from '../../../../lib'
import { Aviso } from '../../../molecules'
import type { AvisoSinCalendarioProps } from './AvisoSinCalendario.types'

/** En el detalle de una declaración presentada antes de que el municipio cargara el calendario de su año gravable. */
export default function AvisoSinCalendario({ d, carga }: AvisoSinCalendarioProps) {
  return (
    <Aviso tono="alerta" icono={Calendar}>
      <p className="font-medium">
        {carga
          ? `Se presentó el ${formatoFecha(d.fechaPresentacion)}, antes de que el municipio cargara el calendario del año gravable ${d.vigencia} (lo cargó ${carga.por || 'el municipio'} el ${formatoFecha(carga.fecha)}).`
          : `Se presentó sin el calendario del año gravable ${d.vigencia}: el municipio todavía no lo ha cargado.`}
      </p>
      <p className="mt-0.5">
        Revisa que el vencimiento, la sanción y los intereses estén bien: se liquidaron sin las
        fechas oficiales.
      </p>
    </Aviso>
  )
}
