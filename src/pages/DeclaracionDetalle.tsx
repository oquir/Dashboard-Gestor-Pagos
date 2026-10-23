import { ArrowLeft, TickCircle, Download, AlertTriangle } from 'reicon-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ListaArchivos from '../components/ListaArchivos'
import Tabla from '../components/Tabla'
import { Badge, Boton, Campo, Card, CardHeader, Dato, PageHeader, Select, Textarea, Vacio } from '../components/ui'
import {
  etiquetaEstadoPago,
  etiquetaEstadoRevision,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  formatoFecha,
  formatoPesos,
} from '../lib/formato'
import { puede } from '../lib/permisos'
import { descargarDeclaracion } from '../lib/pdfDeclaracion'
import { estadoPago, RENGLONES_TOTALES, totalPagado } from '../lib/reglas'
import { conRit, impuestoActivo, seValidaContraRit, useSesion } from '../lib/sesion'
import { ayudanteColumnas } from '../lib/tabla'
import { tonoPago, tonoRevision } from '../lib/tonos'
import { useDatos } from '../store'
import type { Declaracion, EstadoRevision, Inscripcion, Renglon } from '../types'

const col = ayudanteColumnas<Renglon>()

// Sin ordenamiento: la liquidación se lee en el orden del formulario.
const COLUMNAS_RENGLONES = col.columns([
  col.accessor('codigo', { header: 'Renglón', enableSorting: false, meta: { clase: 'w-20 tabular-nums text-slate-500' } }),
  col.accessor('concepto', { header: 'Concepto', enableSorting: false, meta: { clase: 'text-slate-700' } }),
  col.accessor('valor', {
    header: 'Valor',
    enableSorting: false,
    meta: { alinear: 'derecha', clase: 'whitespace-nowrap tabular-nums text-slate-900' },
    cell: ({ getValue }) => formatoPesos(getValue()),
  }),
])

/** Cruces automáticos que el funcionario ve antes de dar la declaración por revisada. */
function validaciones(d: Declaracion, ins: Inscripcion | undefined, contraRit: boolean) {
  const resultado: { ok: boolean; texto: string }[] = []
  const valor = (codigo: string) => d.renglones.find((r) => r.codigo === codigo)?.valor ?? 0
  const tiene = (calidad: string) => ins?.calidades.some((c) => c.calidad === calidad) ?? false

  // Cruces con el RIT: solo si el municipio tiene el RIT y la validación activa en este formulario.
  if (contraRit) {
    if (d.impuesto === 'reteica') {
      resultado.push({ ok: tiene('agente_retenedor'), texto: 'El declarante tiene la calidad de agente retenedor en el RIT' })
    }
    if (d.impuesto === 'autorretencion') {
      resultado.push({ ok: tiene('autorretenedor'), texto: 'El declarante está designado como autorretenedor en el RIT' })
    }
    if (d.impuesto === 'ica') {
      resultado.push({ ok: !ins?.regimenSimple, texto: 'El declarante no está en el SIMPLE según el RIT (allí el ICA se declara ante la DIAN)' })
      if (valor('28') > 0) resultado.push({ ok: tiene('autorretenedor'), texto: 'Las autorretenciones (renglón 28) corresponden a un autorretenedor del RIT' })
    }
  }
  if (d.tipo !== 'clausura') {
    const extemporanea = d.fechaPresentacion > d.fechaVencimiento
    const sancion = valor('31') + valor('S')
    resultado.push(
      extemporanea
        ? { ok: sancion > 0, texto: 'Presentada después del vencimiento: liquida sanción por extemporaneidad' }
        : { ok: true, texto: 'Presentada dentro del plazo' },
    )
  }
  if (d.tipo === 'correccion') resultado.push({ ok: Boolean(d.corrigeA), texto: 'Indica la declaración que corrige' })
  if (d.tipo === 'clausura') resultado.push({ ok: Boolean(d.fechaCierre), texto: 'Indica la fecha exacta de cierre' })
  return resultado
}

function FormularioRevision({ declaracion }: { declaracion: Declaracion }) {
  const revisarDeclaracion = useDatos((s) => s.revisarDeclaracion)
  const [estado, setEstado] = useState<EstadoRevision>(declaracion.estadoRevision === 'pendiente' ? 'revisada' : declaracion.estadoRevision)
  const [observacion, setObservacion] = useState(declaracion.observacion ?? '')
  const [guardado, setGuardado] = useState(false)
  const falta = estado === 'con_observaciones' && !observacion.trim()

  return (
    <div className="space-y-3 p-5">
      <Campo etiqueta="Resultado">
        <Select value={estado} onChange={(e) => { setEstado(e.target.value as EstadoRevision); setGuardado(false) }}>
          <option value="revisada">Revisada sin observaciones</option>
          <option value="con_observaciones">Con observaciones</option>
          <option value="pendiente">Dejar por revisar</option>
        </Select>
      </Campo>
      <Campo etiqueta="Observación" error={falta ? 'Escribe la observación.' : undefined}>
        <Textarea rows={3} value={observacion} onChange={(e) => { setObservacion(e.target.value); setGuardado(false) }} />
      </Campo>
      <div className="flex items-center gap-3">
        <Boton variante="primario" disabled={falta} onClick={() => { revisarDeclaracion(declaracion.id, estado, observacion.trim()); setGuardado(true) }}>
          Guardar revisión
        </Boton>
        {guardado && <span className="text-sm text-emerald-700">Guardado</span>}
      </div>
    </div>
  )
}

export default function DeclaracionDetalle() {
  const { id } = useParams()
  const { usuario } = useSesion()
  const declaraciones = useDatos((s) => s.declaraciones)
  const inscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const municipios = useDatos((s) => s.municipios)
  const d = declaraciones.find((x) => x.id === id)

  if (!d || (usuario?.municipioId && d.municipioId !== usuario.municipioId)) {
    return <Vacio titulo="No se encontró la declaración" descripcion="Puede que no exista o que sea de otro municipio." />
  }
  if (!impuestoActivo(municipios)(d)) {
    return <Vacio titulo={`${etiquetaImpuesto[d.impuesto]} no está activo en este municipio`} descripcion="1cero1 lo puede activar en Municipios." />
  }

  const ins = inscripciones.find((i) => i.id === d.inscripcionId)
  const pagosDeEsta = pagos.filter((p) => p.declaracionId === d.id)
  const pagado = totalPagado(d.id, pagos)
  const estado = estadoPago(d, pagos)
  const corregida = d.corrigeA ? declaraciones.find((x) => x.id === d.corrigeA) : undefined
  const reemplazo = declaraciones.find((x) => x.corrigeA === d.id)
  const diasMora = Math.round((Date.parse(d.fechaPresentacion) - Date.parse(d.fechaVencimiento)) / 86400000)
  const municipioConRit = conRit(municipios)(d)
  const contraRit = seValidaContraRit(municipios, d)

  return (
    <>
      <Link to="/declaraciones" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> Declaraciones
      </Link>
      <PageHeader
        titulo={`${etiquetaImpuesto[d.impuesto]} · ${etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo)}`}
        descripcion={`Radicado ${d.numero}`}
        acciones={
          <>
            <Badge tono="info">{etiquetaTipoDeclaracion[d.tipo]}</Badge>
            <Badge tono={tonoPago[estado]}>{etiquetaEstadoPago[estado]}</Badge>
            <Badge tono={tonoRevision[d.estadoRevision]}>{etiquetaEstadoRevision[d.estadoRevision]}</Badge>
          </>
        }
      />

      {reemplazo && (
        <p className="mb-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Esta declaración fue reemplazada por la corrección{' '}
          <Link className="font-medium underline" to={`/declaraciones/${reemplazo.id}`}>{reemplazo.numero}</Link>.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              titulo="Liquidación"
              descripcion="Valores redondeados al múltiplo de mil más cercano."
              acciones={
                <Boton variante="secundario" onClick={() => descargarDeclaracion(d, useDatos.getState())}>
                  <Download className="size-4" aria-hidden /> Descargar PDF
                </Boton>
              }
            />
            <Tabla datos={d.renglones} columnas={COLUMNAS_RENGLONES} densa claseFila={(r) => (RENGLONES_TOTALES.has(r.codigo) ? 'bg-slate-50 font-semibold' : '')} />
          </Card>

          <Card>
            <CardHeader
              titulo="Pagos"
              descripcion={d.impuesto === 'ica' ? 'El ICA anual admite pago parcial.' : 'Sin pago total, esta declaración no produce efecto (es ineficaz).'}
            />
            {pagosDeEsta.length === 0 ? (
              <Vacio titulo="No hay pagos registrados" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {pagosDeEsta.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-slate-700">
                      {formatoFecha(p.fecha)} · {p.medio}
                    </span>
                    <span className="tabular-nums text-slate-900">{formatoPesos(p.valor)}</span>
                  </li>
                ))}
              </ul>
            )}
            <dl className="grid grid-cols-2 gap-4 border-t border-slate-100 p-5">
              <Dato etiqueta="Total pagado">{formatoPesos(pagado)}</Dato>
              <Dato etiqueta="Saldo pendiente">{formatoPesos(Math.max(d.totalAPagar - pagado, 0))}</Dato>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader titulo="Datos" />
            <dl className="space-y-4 p-5">
              <Dato etiqueta="Declarante">
                {!ins ? '—' : municipioConRit ? <Link className="font-medium text-brand-700 hover:underline" to={`/rit/${ins.id}`}>{ins.nombre}</Link> : ins.nombre}
              </Dato>
              <Dato etiqueta="Número de factura">
                <span className="tabular-nums">{d.numeroFactura}</span>
              </Dato>
              <Dato etiqueta="Vencimiento">{formatoFecha(d.fechaVencimiento)}</Dato>
              <Dato etiqueta="Presentación">
                {formatoFecha(d.fechaPresentacion)}
                {d.tipo !== 'clausura' && diasMora > 0 && <span className="text-amber-700"> · {diasMora} días tarde</span>}
              </Dato>
              {d.fechaCierre && <Dato etiqueta="Fecha de cierre">{formatoFecha(d.fechaCierre)}</Dato>}
              {corregida && (
                <Dato etiqueta="Corrige a">
                  <Link className="font-medium text-brand-700 hover:underline" to={`/declaraciones/${corregida.id}`}>{corregida.numero}</Link>
                </Dato>
              )}
            </dl>
          </Card>

          <Card>
            <ListaArchivos
              titulo="Archivos adjuntos"
              descripcion="Anexos que el contribuyente cargó con la declaración."
              items={d.adjuntos.map((a) => ({ titulo: a.nombre, archivo: a.archivo }))}
              contexto={[`Declaración ${d.numero}`, `Declarante: ${ins?.nombre ?? ''}`]}
              nombreZip={`adjuntos_${d.numero}.zip`}
              vacio="No cargó archivos."
            />
          </Card>

          <Card>
            <CardHeader
              titulo="Validaciones"
              descripcion={
                contraRit
                  ? undefined
                  : municipioConRit
                    ? 'Este formulario no se valida contra el RIT.'
                    : 'El municipio no tiene el RIT en el aplicativo: no hay cruces contra el RIT.'
              }
            />
            <ul className="space-y-2 p-5">
              {validaciones(d, ins, contraRit).map((v) => (
                <li key={v.texto} className="flex items-start gap-2 text-sm">
                  {v.ok ? (
                    <TickCircle className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Cumple" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Inconsistencia" />
                  )}
                  <span className={v.ok ? 'text-slate-700' : 'font-medium text-red-700'}>{v.texto}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader titulo="Revisión" />
            {puede(usuario?.rol, 'revisar') ? (
              <FormularioRevision key={d.id} declaracion={d} />
            ) : (
              <div className="p-5 text-sm text-slate-600">
                {d.observacion ?? 'Sin observaciones.'}
                <p className="mt-2 text-xs text-slate-500">La revisión la hace la administración municipal.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
