import { Danger } from 'reicon-react'
import { formatoFecha, plazoConsignacion } from '../../../../lib'
import { Aviso } from '../../../molecules'
import type { AvisoSinConsignarProps } from './AvisoSinConsignar.types'

/** En el detalle de una ReteICA o AutoReteICA con saldo: hasta cuándo hay para consignarlo y qué pasa si no. */
export default function AvisoSinConsignar({ r }: AvisoSinConsignarProps) {
  const retenido = r.d.impuesto === 'autorretencion' ? 'Lo autorretenido' : 'Lo retenido'

  if (r.dias < 0) {
    return (
      <Aviso tono="peligro" icono={Danger} rol="alert">
        <p className="font-medium">
          {retenido} no se consignó a tiempo: el plazo de 2 meses venció el {formatoFecha(r.limite)}
          .
        </p>
        <p className="mt-0.5">
          No consignarlo puede ser delito (art. 402 del Código Penal). Si paga todo con intereses,
          se puede cerrar el proceso penal.
        </p>
      </Aviso>
    )
  }
  return (
    <Aviso tono="alerta" icono={Danger}>
      <p className="font-medium">
        {retenido} no se ha consignado. Hay plazo hasta el {formatoFecha(r.limite)} (
        {plazoConsignacion(r.dias).toLowerCase()}), 2 meses después del vencimiento de la
        declaración.
      </p>
      <p className="mt-0.5">
        Si para entonces no se paga completo, puede ser delito (art. 402 del Código Penal).
      </p>
    </Aviso>
  )
}
