import { documentFormat, formatDate } from '../../../../lib'
import { Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import type { CancellationCardProps } from './CancellationCard.types'

/** Lo que diligenció el contribuyente al pedir la cancelación del RIT. */
export default function CancellationCard({ registration, cancellation }: CancellationCardProps) {
  return (
    <Card>
      <CardHeader title="Datos de la cancelación" />
      <dl className="grid gap-5 p-5 sm:grid-cols-2">
        <DataItem label="Nombre o razón social">{registration.name}</DataItem>
        <DataItem label="Documento">{documentFormat(registration)}</DataItem>
        <DataItem label="Fecha de cese de actividades">
          {formatDate(cancellation.cessationDate)}
        </DataItem>
        <DataItem label="Motivo">{cancellation.reason}</DataItem>
      </dl>
    </Card>
  )
}
