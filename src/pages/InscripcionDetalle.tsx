import { ArrowLeft, TickCircle, CloseCircle, Download, Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useParams } from 'react-router'
import ListaArchivos from '../components/ListaArchivos'
import { Badge, Boton, Campo, Card, CardHeader, Dato, PageHeader, Textarea, Vacio } from '../components/ui'
import {
  etiquetaCalidad,
  etiquetaEstadoInscripcion,
  etiquetaEstadoNovedad,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  etiquetaTipoNovedad,
  etiquetaTipoPersona,
  formatoFecha,
  formatoPesos,
} from '../lib/formato'
import { descargarArchivo, formatoTamano, guardarArchivo } from '../lib/archivos'
import { puede } from '../lib/permisos'
import { conRit, impuestoActivo, useSesion } from '../lib/sesion'
import { tonoInscripcion, tonoNovedad } from '../lib/tonos'
import { useDatos } from '../store'
import type { Calidad, Novedad } from '../types'

const HABILITA: Record<Calidad, string> = {
  contribuyente: 'Declara ICA anual.',
  agente_retenedor: 'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  autorretenedor: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}

const TAMANO_MAXIMO = 10 * 1024 * 1024
const FORMATOS = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'

/** Tarjeta con la que la administración resuelve una solicitud del RIT y le responde al contribuyente. */
function RespuestaSolicitud({ inscripcionId, novedad, correo }: { inscripcionId: string; novedad: Novedad; correo: string }) {
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
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus-within:ring-2 focus-within:ring-brand-500 hover:border-brand-500 hover:text-brand-700">
            <Paperclip className="size-4" aria-hidden /> Adjuntar documentos
            <input type="file" multiple accept={FORMATOS} className="sr-only" onChange={agregar} />
          </label>
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

export default function InscripcionDetalle() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const inscripcion = useDatos((s) => s.inscripciones.find((i) => i.id === id))
  const todasDeclaraciones = useDatos((s) => s.declaraciones)
  const configuraciones = useDatos((s) => s.configuraciones)
  const municipios = useDatos((s) => s.municipios)

  if (!inscripcion || (usuario?.municipioId && inscripcion.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la inscripción" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!conRit(municipios)(inscripcion)) {
    return <Vacio titulo="El RIT no está en el aplicativo para este municipio" descripcion="1cero1 lo puede activar en Municipios." />
  }

  const config = configuraciones.find((c) => c.municipioId === inscripcion.municipioId)
  const declaraciones = todasDeclaraciones
    .filter((d) => d.inscripcionId === inscripcion.id)
    .filter(impuestoActivo(municipios))
    .sort((a, b) => b.fechaPresentacion.localeCompare(a.fechaPresentacion))
  const puedeRevisar = puede(usuario?.rol, 'revisar')
  const novedades = [...inscripcion.novedades].reverse()

  return (
    <>
      <Link to="/rit" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> Inscripciones RIT
      </Link>
      <PageHeader
        titulo={inscripcion.nombre}
        descripcion={`RIT ${inscripcion.numeroRit} · ${municipios.find((m) => m.id === inscripcion.municipioId)?.nombre}`}
        acciones={<Badge tono={tonoInscripcion[inscripcion.estado]}>{etiquetaEstadoInscripcion[inscripcion.estado]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader titulo="Datos del inscrito" />
            <dl className="grid gap-5 p-5 sm:grid-cols-2">
              <Dato etiqueta="Tipo de persona">{etiquetaTipoPersona[inscripcion.tipoPersona]}</Dato>
              <Dato etiqueta="Documento">
                {inscripcion.tipoDocumento} {inscripcion.documento}
                {inscripcion.dv && `-${inscripcion.dv}`}
              </Dato>
              {inscripcion.representanteLegal && <Dato etiqueta="Representante legal">{inscripcion.representanteLegal}</Dato>}
              <Dato etiqueta="Inicio de actividades">{formatoFecha(inscripcion.fechaInicioActividades)}</Dato>
              <Dato etiqueta="Dirección">{inscripcion.direccion}</Dato>
              <Dato etiqueta="Contacto">
                {inscripcion.telefono} · {inscripcion.correo}
              </Dato>
              <Dato etiqueta="Régimen SIMPLE">
                {inscripcion.regimenSimple ? 'Sí: declara su ICA consolidado ante la DIAN y no se le practica ReteICA' : 'No'}
              </Dato>
            </dl>
          </Card>

          <Card>
            <CardHeader titulo="Calidades" descripcion="Nacen de la norma o del acto de designación, no de la inscripción." />
            <ul className="divide-y divide-slate-100">
              {inscripcion.calidades.map((c) => (
                <li key={c.calidad} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{etiquetaCalidad[c.calidad]}</p>
                    <p className="text-xs text-slate-500">{HABILITA[c.calidad]}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Desde {formatoFecha(c.desde)}</p>
                    {c.acto && <p>{c.acto}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader titulo="Actividades económicas" />
            <ul className="divide-y divide-slate-100">
              {inscripcion.actividades.map((a) => (
                <li key={a.ciiu} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <span className="tabular-nums text-slate-500">CIIU {a.ciiu}</span> · <span className="text-slate-900">{a.descripcion}</span>
                    {a.principal && <Badge tono="info">Principal</Badge>}
                  </div>
                  <span className="whitespace-nowrap text-slate-600">{config?.tarifas.find((t) => t.ciiu === a.ciiu)?.porMil ?? '—'} por mil</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader titulo="Declaraciones presentadas" />
            {declaraciones.length === 0 ? (
              <Vacio titulo="Sin declaraciones" descripcion={inscripcion.regimenSimple ? 'Está en el SIMPLE: su ICA se declara ante la DIAN.' : undefined} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {declaraciones.map((d) => (
                  <li key={d.id}>
                    <Link to={`/declaraciones/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {etiquetaImpuesto[d.impuesto]} · {etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {d.numero} · {etiquetaTipoDeclaracion[d.tipo]} · presentada el {formatoFecha(d.fechaPresentacion)}
                        </p>
                      </div>
                      <span className="whitespace-nowrap tabular-nums text-slate-700">{formatoPesos(d.totalAPagar)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader titulo="Solicitudes y novedades" />
            <ol className="space-y-4 p-5">
              {novedades.map((n) => (
                <li key={n.id} className="border-l-2 border-slate-200 pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{etiquetaTipoNovedad[n.tipo]}</span>
                    <Badge tono={tonoNovedad[n.estado]}>{etiquetaEstadoNovedad[n.estado]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{n.descripcion}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Radicada el {formatoFecha(n.fecha)}
                    {n.revisadaPor && n.fechaRevision && ` · revisó ${n.revisadaPor} el ${formatoFecha(n.fechaRevision)}`}
                  </p>
                  {(n.observacion || n.documentosRespuesta) && (
                    <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs">
                      <p className="font-medium text-slate-600">Respuesta enviada al contribuyente</p>
                      {n.observacion && <p className="mt-1 text-slate-700">{n.observacion}</p>}
                      {n.documentosRespuesta && (
                        <ul className="mt-1.5 space-y-1">
                          {n.documentosRespuesta.map((a, i) => (
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
                  )}
                  {n.tipo === 'cancelacion' && n.estado === 'pendiente' && config && (
                    <p className="mt-1 text-xs text-amber-800">
                      {config.cancelacionRitAutomatica
                        ? 'En este municipio la cancelación es automática al aprobar.'
                        : 'La administración debe verificar el cese antes de aprobar la cancelación.'}
                    </p>
                  )}
                  {n.estado === 'pendiente' && puedeRevisar && (
                    <a href={`#respuesta-${n.id}`} className="mt-2 inline-block text-xs font-medium text-brand-700 hover:underline">
                      Responder solicitud
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <ListaArchivos
              titulo="Soportes"
              descripcion={`${inscripcion.soportes.filter((s) => s.archivo).length} de ${inscripcion.soportes.length} cargados`}
              items={inscripcion.soportes.map((s) => ({ titulo: s.nombre, archivo: s.archivo }))}
              contexto={[`Contribuyente: ${inscripcion.nombre}`, `RIT: ${inscripcion.numeroRit}`]}
              nombreZip={`soportes_RIT_${inscripcion.numeroRit}.zip`}
            />
          </Card>

          {puedeRevisar &&
            inscripcion.novedades
              .filter((n) => n.estado === 'pendiente')
              .map((n) => <RespuestaSolicitud key={n.id} inscripcionId={inscripcion.id} novedad={n} correo={inscripcion.correo} />)}
        </div>
      </div>
    </>
  )
}
