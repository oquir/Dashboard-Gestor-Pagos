import { Download } from 'reicon-react'
import { descargarArchivo, formatoTamano } from '../../../lib/archivos'
import type { Inscripcion, Novedad } from '../../../types'

/** Observación y documentos que la administración le envió al contribuyente al resolver la solicitud. */
export default function RespuestaEnviada({ novedad, inscripcion }: { novedad: Novedad; inscripcion: Inscripcion }) {
  if (!novedad.observacion && !novedad.documentosRespuesta) return null

  return (
    <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs">
      <p className="font-medium text-slate-600">Respuesta enviada al contribuyente</p>
      {novedad.observacion && <p className="mt-1 text-slate-700">{novedad.observacion}</p>}
      {novedad.documentosRespuesta && (
        <ul className="mt-1.5 space-y-1">
          {novedad.documentosRespuesta.map((a, i) => (
            <li key={`${a.nombre}-${i}`}>
              <button
                type="button"
                onClick={() => descargarArchivo(a, 'Respuesta a la solicitud', [`Contribuyente: ${inscripcion.nombre}`, `RIT: ${inscripcion.numeroRit}`])}
                className="inline-flex max-w-full items-center gap-1.5 text-left text-brand-700 hover:underline"
              >
                <Download className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{a.nombre}</span>
                <span className="shrink-0 text-slate-500">· {formatoTamano(a.tamano)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
