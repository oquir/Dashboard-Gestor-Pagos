import { TickCircle, CloseCircle } from 'reicon-react'
import { useState } from 'react'
import { guardarArchivo } from '../../../../lib/archivos'
import { etiquetaTipoNovedad, formatoFecha } from '../../../../lib/formato'
import { useDatos } from '../../../../store'
import { Boton, Card, Textarea } from '../../../atoms'
import { AdjuntarDocumentos, Campo, CardHeader } from '../../../molecules'
import type { Respuesta, RespuestaSolicitudProps } from './RespuestaSolicitud.types'

/** Tarjeta con la que la administración resuelve una solicitud del RIT y le responde al contribuyente. */
export default function RespuestaSolicitud({
  inscripcionId,
  novedad,
  correo,
}: RespuestaSolicitudProps) {
  const resolverNovedad = useDatos((s) => s.resolverNovedad)
  const [mensaje, setMensaje] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [faltaMotivo, setFaltaMotivo] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const responder = async (estado: Respuesta) => {
    if (estado === 'rechazada' && !mensaje.trim()) return setFaltaMotivo(true)
    setEnviando(true)
    const documentos = await Promise.all(archivos.map(guardarArchivo))
    resolverNovedad(inscripcionId, novedad.id, estado, mensaje.trim(), documentos)
  }

  return (
    <Card id={`respuesta-${novedad.id}`} className="scroll-mt-6">
      <CardHeader
        titulo="Respuesta al contribuyente"
        descripcion={`${etiquetaTipoNovedad[novedad.tipo]} radicada el ${formatoFecha(novedad.fecha)}. Se envía a ${correo}.`}
      />
      <div className="space-y-4 p-5">
        <Campo
          etiqueta="Mensaje"
          ayuda="Obligatorio para rechazar."
          error={faltaMotivo ? 'Indica el motivo del rechazo.' : undefined}
        >
          <Textarea
            rows={4}
            placeholder="Ej.: el certificado de existencia se cargó vacío. Adjunte el documento completo en su próxima solicitud."
            value={mensaje}
            onChange={(e) => {
              setMensaje(e.target.value)
              setFaltaMotivo(false)
            }}
          />
        </Campo>
        <AdjuntarDocumentos archivos={archivos} onChange={setArchivos} />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3">
        <Boton variante="primario" disabled={enviando} onClick={() => responder('aprobada')}>
          <TickCircle className="size-4" aria-hidden /> Aprobar
        </Boton>
        <Boton variante="secundario" disabled={enviando} onClick={() => responder('rechazada')}>
          <CloseCircle className="size-4" aria-hidden /> Rechazar
        </Boton>
      </div>
    </Card>
  )
}
