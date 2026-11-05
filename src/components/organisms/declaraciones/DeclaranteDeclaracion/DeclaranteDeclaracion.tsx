import { Link } from 'react-router'
import { etiquetaCargoContable, formatoDocumento } from '../../../../lib/formato'
import { Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import type { DeclaranteDeclaracionProps } from './types'

/** Lo que escribió el declarante en la declaración y quiénes la firman. Si está en el RIT, su nombre lleva a la ficha. */
export default function DeclaranteDeclaracion({ d, ins }: DeclaranteDeclaracionProps) {
  const { declarante: dec } = d
  const c = dec.contador

  return (
    <>
      <Card>
        <CardHeader titulo="Declarante" descripcion="Tal como lo escribió en la declaración." />
        <dl className="space-y-4 p-5">
          <Dato etiqueta="Nombre o razón social">
            {ins ? <Link className="font-medium text-brand-700 hover:underline" to={`/rit/${ins.id}`}>{dec.nombre}</Link> : dec.nombre}
          </Dato>
          <Dato etiqueta="Documento">
            <span className="tabular-nums">{formatoDocumento(dec)}</span>
          </Dato>
          <Dato etiqueta="Dirección">{dec.direccion}</Dato>
          <Dato etiqueta="Teléfono">{dec.telefono}</Dato>
          <Dato etiqueta="Correo">{dec.correo}</Dato>
          {dec.establecimientos !== undefined && <Dato etiqueta="Establecimientos en el municipio">{dec.establecimientos}</Dato>}
        </dl>
      </Card>

      <Card>
        <CardHeader titulo="Firmas" />
        <dl className="space-y-4 p-5">
          <Dato etiqueta={dec.representanteLegal ? 'Representante legal' : 'Declarante'}>{dec.representanteLegal ?? dec.nombre}</Dato>
          <Dato etiqueta={c ? etiquetaCargoContable[c.cargo] : 'Contador o revisor fiscal'}>
            {c ? (
              <>
                {c.nombre}
                <span className="block text-xs tabular-nums text-slate-500">
                  {formatoDocumento(c)} · Tarjeta profesional {c.tarjetaProfesional}
                </span>
              </>
            ) : (
              <span className="text-slate-500">No firma</span>
            )}
          </Dato>
        </dl>
      </Card>
    </>
  )
}
