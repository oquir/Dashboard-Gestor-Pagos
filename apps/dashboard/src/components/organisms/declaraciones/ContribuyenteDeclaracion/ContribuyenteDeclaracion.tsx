import { Link } from 'react-router'
import { etiquetaTipoDocumento, numeroDocumento } from '../../../../lib/formato'
import { Badge, Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import { CLASE_LISTA } from './constants'
import type { ContribuyenteDeclaracionProps } from './types'

/** Los datos de la empresa o de la persona que declara, tal como se escribieron. Si está en el RIT, su nombre lleva a la ficha. */
export default function ContribuyenteDeclaracion({ d, ins, noInscrito = false, ancha = false }: ContribuyenteDeclaracionProps) {
  const { contribuyente: c } = d

  return (
    <Card>
      <CardHeader
        titulo="Contribuyente"
        descripcion="Los datos de la empresa o de la persona, tal como se escribieron en la declaración."
        acciones={noInscrito && <Badge tono="alerta">No inscrito en el RIT</Badge>}
      />
      <dl className={ancha ? CLASE_LISTA.ancha : CLASE_LISTA.angosta}>
        <Dato etiqueta="Nombre o razón social">
          {ins ? <Link className="font-medium text-brand-700 hover:underline" to={`/rit/${ins.id}`}>{c.nombre}</Link> : c.nombre}
        </Dato>
        <Dato etiqueta="Tipo de documento">{etiquetaTipoDocumento[c.tipoDocumento]}</Dato>
        <Dato etiqueta="Número de documento">
          <span className="tabular-nums">{numeroDocumento(c)}</span>
        </Dato>
        <Dato etiqueta="Dirección">{c.direccion}</Dato>
        <Dato etiqueta="Teléfono">{c.telefono}</Dato>
        <Dato etiqueta="Correo">{c.correo}</Dato>
        {c.establecimientos !== undefined && <Dato etiqueta="Establecimientos en el municipio">{c.establecimientos}</Dato>}
      </dl>
    </Card>
  )
}
