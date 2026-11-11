import { etiquetaRol, formatoFecha, formatoHora } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Badge, Card } from '../../../atoms'
import { CardHeader, Dato } from '../../../molecules'
import { nombreMunicipio, textoResultado } from '../TablaBitacora'
import type { PeticionBitacoraProps } from './PeticionBitacora.types'

/** Quién hizo la petición, cuándo, a qué endpoint y si salió bien. */
export default function PeticionBitacora({ r }: PeticionBitacoraProps) {
  const municipios = useDatos((s) => s.municipios)

  return (
    <Card>
      <CardHeader titulo="Petición" />
      <dl className="space-y-4 p-5">
        <Dato etiqueta="Fecha y hora">
          {formatoFecha(r.fechaHora.slice(0, 10))}, {formatoHora(r.fechaHora)}
        </Dato>
        <Dato etiqueta="Usuario">
          {r.usuario.nombre}
          <span className="block text-xs text-slate-500">{etiquetaRol[r.usuario.rol]}</span>
        </Dato>
        <Dato etiqueta="Municipio">{nombreMunicipio(r, municipios)}</Dato>
        <Dato etiqueta="Controlador">{r.controlador}</Dato>
        <Dato etiqueta="Acción">
          <span className="font-mono">{r.accion}</span>
        </Dato>
        <Dato etiqueta="Endpoint">
          <span className="break-all font-mono">{r.endpoint}</span>
        </Dato>
        <Dato etiqueta="Resultado">
          <Badge tono={r.exito ? 'exito' : 'peligro'}>{textoResultado(r)}</Badge>
        </Dato>
      </dl>
    </Card>
  )
}
