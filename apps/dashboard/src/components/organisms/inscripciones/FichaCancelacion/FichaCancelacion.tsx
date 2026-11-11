import { formatoDocumento, formatoFecha } from '../../../../lib/formato'
import { Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import type { FichaCancelacionProps } from './types'

/** Lo que diligenció el contribuyente al pedir la cancelación del RIT. */
export default function FichaCancelacion({ inscripcion, cancelacion }: FichaCancelacionProps) {
  return (
    <Card>
      <CardHeader titulo="Datos de la cancelación" />
      <dl className="grid gap-5 p-5 sm:grid-cols-2">
        <Dato etiqueta="Nombre o razón social">{inscripcion.nombre}</Dato>
        <Dato etiqueta="Documento">{formatoDocumento(inscripcion)}</Dato>
        <Dato etiqueta="Fecha de cese de actividades">{formatoFecha(cancelacion.fechaCese)}</Dato>
        <Dato etiqueta="Motivo">{cancelacion.motivo}</Dato>
      </dl>
    </Card>
  )
}
