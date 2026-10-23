import { ArrowLeft, ChevronRight, TickCircle, CloseCircle, Download, Document, Paperclip, Xmark } from 'reicon-react'
import { useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
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
import { actividadesDe } from '../lib/reglas'
import { conRit, impuestoActivo, useSesion } from '../lib/sesion'
import { tonoInscripcion, tonoNovedad } from '../lib/tonos'
import { useDatos } from '../store'
import type { Calidad, DatosRit, Novedad, Tarifa } from '../types'

const HABILITA: Record<Calidad, string> = {
  contribuyente: 'Declara ICA anual.',
  agente_retenedor: 'Declara ReteICA: el portal solo la habilita con esta responsabilidad en el RIT.',
  autorretenedor: 'Declara AutoReteICA; a este sujeto no se le practica ReteICA.',
}

const campos = (d: DatosRit): [string, string | undefined][] => [
  ['Nombre o razón social', d.nombre],
  ['Tipo de persona', etiquetaTipoPersona[d.tipoPersona]],
  ['Documento', `${d.tipoDocumento} ${d.documento}${d.dv ? `-${d.dv}` : ''}`],
  ['Representante legal', d.representanteLegal],
  ['Inicio de actividades', formatoFecha(d.fechaInicioActividades)],
  ['Dirección', d.direccion],
  ['Teléfono', d.telefono],
  ['Correo', d.correo],
  ['Régimen SIMPLE', d.regimenSimple ? 'Sí: declara su ICA consolidado ante la DIAN y no se le practica ReteICA' : 'No'],
]

/** Datos, calidades y actividades del inscrito. Con `anterior`, marca lo que cambió frente a ese formulario. */
function FichaRit({ datos, anterior, tarifas }: { datos: DatosRit; anterior?: DatosRit; tarifas?: Tarifa[] }) {
  const antes = anterior && new Map(campos(anterior))
  const agregada = (nueva: boolean) => anterior && nueva && <Badge tono="alerta">Agregada</Badge>

  return (
    <>
      <Card>
        <CardHeader titulo="Datos del inscrito" />
        <dl className="grid gap-5 p-5 sm:grid-cols-2">
          {campos(datos).map(([etiqueta, valor]) => {
            const previo = antes?.get(etiqueta)
            if (!valor && !previo) return null
            return (
              <Dato key={etiqueta} etiqueta={etiqueta}>
                {valor ?? '—'}
                {antes && previo !== valor && (
                  <>
                    {' '}
                    <Badge tono="alerta">Modificado</Badge>
                    <span className="mt-0.5 block text-xs text-slate-500">Antes: {previo ?? '—'}</span>
                  </>
                )}
              </Dato>
            )
          })}
        </dl>
      </Card>

      <Card>
        <CardHeader titulo="Calidades" descripcion="Nacen de la norma o del acto de designación, no de la inscripción." />
        <ul className="divide-y divide-slate-100">
          {datos.calidades.map((c) => (
            <li key={c.calidad} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {etiquetaCalidad[c.calidad]} {agregada(!anterior?.calidades.some((a) => a.calidad === c.calidad))}
                </p>
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
          {datos.actividades.map((a) => (
            <li key={a.ciiu} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <span className="tabular-nums text-slate-500">CIIU {a.ciiu}</span> · <span className="text-slate-900">{a.descripcion}</span>
                {a.principal && <Badge tono="info">Principal</Badge>} {agregada(!anterior?.actividades.some((x) => x.ciiu === a.ciiu))}
              </div>
              {tarifas && <span className="whitespace-nowrap text-slate-600">{tarifas.find((t) => t.ciiu === a.ciiu)?.porMil ?? '—'} por mil</span>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
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

/** Elemento de la línea de tiempo: al elegirlo, su formulario se muestra a la izquierda. */
function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-brand-600 ${activa ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronRight className={`mt-0.5 size-4 shrink-0 ${activa ? 'text-brand-600' : 'text-slate-400'}`} aria-hidden />
    </button>
  )
}

export default function InscripcionDetalle() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const inscripcion = useDatos((s) => s.inscripciones.find((i) => i.id === id))
  const todasDeclaraciones = useDatos((s) => s.declaraciones)
  const configuraciones = useDatos((s) => s.configuraciones)
  const cargasActividades = useDatos((s) => s.actividades)
  const municipios = useDatos((s) => s.municipios)
  /** Solicitud cuyo formulario se está viendo; null = los datos actuales. */
  const [seleccion, setSeleccion] = useState<string | null>(null)

  if (!inscripcion || (usuario?.municipioId && inscripcion.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la inscripción" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!conRit(municipios)(inscripcion)) {
    return <Vacio titulo="El RIT no está en el aplicativo para este municipio" descripcion="1cero1 lo puede activar en Municipios." />
  }

  const config = configuraciones.find((c) => c.municipioId === inscripcion.municipioId)
  const tarifas = actividadesDe(cargasActividades, inscripcion.municipioId, new Date().getFullYear())?.tarifas ?? []
  const declaraciones = todasDeclaraciones
    .filter((d) => d.inscripcionId === inscripcion.id)
    .filter(impuestoActivo(municipios))
    .sort((a, b) => b.fechaPresentacion.localeCompare(a.fechaPresentacion))
  const puedeRevisar = puede(usuario?.rol, 'revisar')
  const novedades = [...inscripcion.novedades].reverse()
  const solicitud = inscripcion.novedades.find((n) => n.id === seleccion)
  // Se compara con la última solicitud aprobada antes de la elegida.
  const anterior = solicitud && inscripcion.novedades.slice(0, inscripcion.novedades.indexOf(solicitud)).findLast((n) => n.estado === 'aprobada' && n.datos)?.datos
  const soportes = solicitud ? solicitud.soportes : inscripcion.soportes
  const elegir = (novedadId: string | null) => {
    setSeleccion(novedadId)
    // En pantallas angostas la ficha queda arriba de la línea de tiempo.
    const ficha = document.getElementById('ficha')
    if (ficha && ficha.getBoundingClientRect().top < 0) ficha.scrollIntoView({ behavior: 'smooth' })
  }

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
        <div id="ficha" className="scroll-mt-6 space-y-6 lg:col-span-2">
          {solicitud && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  Formulario de {etiquetaTipoNovedad[solicitud.tipo].toLowerCase()} radicado el {formatoFecha(solicitud.fecha)}
                  <Badge tono={tonoNovedad[solicitud.estado]}>{etiquetaEstadoNovedad[solicitud.estado]}</Badge>
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Lo que diligenció el contribuyente{anterior ? '. Se marca lo que cambió frente a la solicitud aprobada anterior.' : '.'}
                </p>
              </div>
              <Boton variante="secundario" onClick={() => elegir(null)}>
                Ver datos actuales
              </Boton>
            </div>
          )}

          {solicitud?.cancelacion ? (
            <Card>
              <CardHeader titulo="Datos de la cancelación" />
              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <Dato etiqueta="Nombre o razón social">{inscripcion.nombre}</Dato>
                <Dato etiqueta="Documento">
                  {inscripcion.tipoDocumento} {inscripcion.documento}
                  {inscripcion.dv && `-${inscripcion.dv}`}
                </Dato>
                <Dato etiqueta="Fecha de cese de actividades">{formatoFecha(solicitud.cancelacion.fechaCese)}</Dato>
                <Dato etiqueta="Motivo">{solicitud.cancelacion.motivo}</Dato>
              </dl>
            </Card>
          ) : (
            <FichaRit datos={solicitud?.datos ?? inscripcion} anterior={anterior} tarifas={solicitud ? undefined : tarifas} />
          )}

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
            <CardHeader titulo="Solicitudes y novedades" descripcion="Elige una para ver el formulario que diligenció el contribuyente." />
            <ol className="space-y-4 p-5">
              <li className={`border-l-2 pl-2 ${solicitud ? 'border-slate-200' : 'border-brand-600'}`}>
                <Opcion activa={!solicitud} onClick={() => elegir(null)}>
                  <span className="block text-sm font-medium text-slate-900">Datos actuales</span>
                  <span className="mt-1 block text-xs text-slate-500">Cómo está hoy la ficha del inscrito.</span>
                </Opcion>
              </li>
              {novedades.map((n) => (
                <li key={n.id} className={`border-l-2 pl-2 ${solicitud === n ? 'border-brand-600' : 'border-slate-200'}`}>
                  <Opcion activa={solicitud === n} onClick={() => elegir(n.id)}>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{etiquetaTipoNovedad[n.tipo]}</span>
                      <Badge tono={tonoNovedad[n.estado]}>{etiquetaEstadoNovedad[n.estado]}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">{n.descripcion}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Radicada el {formatoFecha(n.fecha)}
                      {n.revisadaPor && n.fechaRevision && ` · revisó ${n.revisadaPor} el ${formatoFecha(n.fechaRevision)}`}
                    </span>
                  </Opcion>
                  <div className="px-2">
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
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <ListaArchivos
              titulo={solicitud ? 'Soportes de la solicitud' : 'Soportes'}
              descripcion={soportes.length > 0 ? `${soportes.filter((s) => s.archivo).length} de ${soportes.length} cargados` : undefined}
              items={soportes.map((s) => ({ titulo: s.nombre, archivo: s.archivo }))}
              contexto={[`Contribuyente: ${inscripcion.nombre}`, `RIT: ${inscripcion.numeroRit}`]}
              nombreZip={`soportes_RIT_${inscripcion.numeroRit}${solicitud ? `_${solicitud.tipo}_${solicitud.fecha}` : ''}.zip`}
              vacio="El contribuyente no cargó documentos con esta solicitud."
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
