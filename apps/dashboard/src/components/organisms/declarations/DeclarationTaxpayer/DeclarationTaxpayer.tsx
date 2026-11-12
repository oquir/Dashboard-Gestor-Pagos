import { Link } from 'react-router'
import { ROW_BUTTON_CLASS } from '../../../../constants'
import { documentTypeLabel, documentNumber, statementPath } from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import { LIST_CLASS } from './DeclarationTaxpayer.constants'
import type { DeclarationTaxpayerProps } from './DeclarationTaxpayer.types'

/** Los datos de la empresa o de la persona que declara, tal como se escribieron. Si está en el RIT, su nombre lleva a la ficha. */
export default function DeclarationTaxpayer({
  d,
  reg,
  unregistered = false,
  wide = false,
  description = 'Los datos de la empresa o de la persona, tal como se escribieron en la declaración.',
  statementLink = true,
}: DeclarationTaxpayerProps) {
  const { taxpayer: c } = d

  return (
    <Card>
      <CardHeader
        title="Contribuyente"
        description={description}
        actions={
          (unregistered || statementLink) && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {unregistered && <Badge tone="alert">No inscrito en el RIT</Badge>}
              {statementLink && (
                <Link to={statementPath(d.municipalityId, c)} className={ROW_BUTTON_CLASS}>
                  Estado de cuenta
                </Link>
              )}
            </div>
          )
        }
      />
      <dl className={wide ? LIST_CLASS.wide : LIST_CLASS.narrow}>
        <DataItem label="Nombre o razón social">
          {reg ? (
            <Link className="font-medium text-brand-fg hover:underline" to={`/rit/${reg.id}`}>
              {c.name}
            </Link>
          ) : (
            c.name
          )}
        </DataItem>
        <DataItem label="Tipo de documento">{documentTypeLabel[c.documentType]}</DataItem>
        <DataItem label="Número de documento">
          <span className="tabular-nums">{documentNumber(c)}</span>
        </DataItem>
        <DataItem label="Dirección">{c.address}</DataItem>
        <DataItem label="Teléfono">{c.phone}</DataItem>
        <DataItem label="Correo">{c.email}</DataItem>
        {c.establishments !== undefined && (
          <DataItem label="Establecimientos en el municipio">{c.establishments}</DataItem>
        )}
      </dl>
    </Card>
  )
}
