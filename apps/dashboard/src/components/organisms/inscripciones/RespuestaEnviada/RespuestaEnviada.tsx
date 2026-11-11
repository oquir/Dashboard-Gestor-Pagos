import { DocumentosEnviados } from '../../../molecules'
import type { RespuestaEnviadaProps } from './types'

/** Observación y documentos que la administración le envió al contribuyente al resolver la solicitud. */
export default function RespuestaEnviada({ novedad, inscripcion }: RespuestaEnviadaProps) {
  if (!novedad.observacion && !novedad.documentosRespuesta) return null

  return (
    <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs">
      <p className="font-medium text-slate-600">Respuesta enviada al contribuyente</p>
      {novedad.observacion && <p className="mt-1 text-slate-700">{novedad.observacion}</p>}
      {novedad.documentosRespuesta && (
        <DocumentosEnviados
          className="mt-1.5"
          documentos={novedad.documentosRespuesta}
          titulo="Respuesta a la solicitud"
          contexto={[`Contribuyente: ${inscripcion.nombre}`, `RIT: ${inscripcion.numeroRit}`]}
        />
      )}
    </div>
  )
}
