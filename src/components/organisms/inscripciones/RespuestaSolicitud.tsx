import { TickCircle, CloseCircle, Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { formatoTamano, guardarArchivo } from '../../../lib/archivos'
import { etiquetaTipoNovedad, formatoFecha } from '../../../lib/formato'
import { useDatos } from '../../../store'
import type { Novedad } from '../../../types'
import { Boton, Card, Textarea } from '../../atoms'
import { Campo, CardHeader, SelectorArchivo } from '../../molecules'

const TAMANO_MAXIMO = 10 * 1024 * 1024
const FORMATOS = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'

/** Tarjeta con la que la administración resuelve una solicitud del RIT y le responde al contribuyente. */
export default function RespuestaSolicitud({ inscripcionId, novedad, correo }: { inscripcionId: string; novedad: Novedad; correo: string }) {
  const resolverNovedad = useDatos((s) => s.resolverNovedad)
  const [mensaje, setMensaje] = useState('')
  const [archivos, setArchivos] = useState<File[]>([])
  const [faltaMotivo, setFaltaMotivo] = useState(false)
  const [muyGrandes, setMuyGrandes] = useState<string[]>([])
  const [enviando, setEnviando] = useState(false)

  const agregar = (e: ChangeEvent<HTMLInputElement>) => {
    const elegidos = Array.from(e.target.files ?? [])
    e.target.value = ''
    setMuyGrandes(elegidos.filter((f) => f.size > TAMANO_MAXIMO).map((f) => f.name))
    setArchivos((actuales) => [...actuales, ...elegidos.filter((f) => f.size <= TAMANO_MAXIMO)])
  }

  const responder = async (estado: 'aprobada' | 'rechazada') => {
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
        <Campo etiqueta="Mensaje" ayuda="Obligatorio para rechazar." error={faltaMotivo ? 'Indica el motivo del rechazo.' : undefined}>
          <Textarea
            rows={4}
            placeholder="Ej.: el certificado de existencia se cargó vacío. Adjunte el documento completo en su próxima solicitud."
            value={mensaje}
            onChange={(e) => { setMensaje(e.target.value); setFaltaMotivo(false) }}
          />
        </Campo>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Documentos para el contribuyente</p>
          {archivos.length > 0 && (
            <ul className="mb-2 divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
              {archivos.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700">
                  <Document className="size-4 shrink-0 text-brand-600" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-xs text-slate-500">{formatoTamano(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => setArchivos((actuales) => actuales.filter((_, j) => j !== i))}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                    aria-label={`Quitar ${f.name}`}
                  >
                    <Xmark className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <SelectorArchivo texto="Adjuntar documentos" icono={Paperclip} multiple accept={FORMATOS} onChange={agregar} />
          {muyGrandes.length > 0 ? (
            <p className="mt-1 text-xs text-red-600">Supera los 10 MB y no se adjuntó: {muyGrandes.join(', ')}.</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">PDF, Word, Excel o imagen, hasta 10 MB cada uno.</p>
          )}
        </div>
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
