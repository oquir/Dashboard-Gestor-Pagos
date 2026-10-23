import { Download } from 'reicon-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router'
import { Boton, Campo, Card, CardHeader, Input, PageHeader } from '../components/ui'
import { descargarCsv } from '../lib/archivos'
import {
  etiquetaCalidad,
  etiquetaEstadoInscripcion,
  etiquetaEstadoPago,
  etiquetaEstadoRevision,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  etiquetaTipoPersona,
} from '../lib/formato'
import { puede } from '../lib/permisos'
import { estadoPago, totalPagado } from '../lib/reglas'
import { conRit, delMunicipio, ritVisible, useDeclaraciones, useSesion } from '../lib/sesion'
import { useDatos } from '../store'
import type { Inscripcion } from '../types'

const hoy = () => new Date().toISOString().slice(0, 10)
const documento = (i: Inscripcion | undefined) => (i ? `${i.tipoDocumento} ${i.documento}${i.dv ? `-${i.dv}` : ''}` : '')

interface Reporte {
  id: string
  titulo: string
  descripcion: string
  /** Si se filtra por el rango de fechas. */
  porFechas: boolean
  /** La primera fila es el encabezado. */
  filas: (string | number)[][]
}

export default function Reportes() {
  const { usuario, municipioId } = useSesion()
  const declaraciones = useDeclaraciones()
  const todasInscripciones = useDatos((s) => s.inscripciones)
  const pagos = useDatos((s) => s.pagos)
  const municipios = useDatos((s) => s.municipios)
  const [desde, setDesde] = useState(`${hoy().slice(0, 4)}-01-01`)
  const [hasta, setHasta] = useState(hoy)
  const rangoInvalido = !desde || !hasta || desde > hasta

  const reportes = useMemo<Reporte[]>(() => {
    const enRango = (fecha: string) => fecha >= desde && fecha <= hasta
    const inscripciones = delMunicipio(todasInscripciones, municipioId)
    const porId = new Map(inscripciones.map((i) => [i.id, i]))
    const nombreMunicipio = new Map(municipios.map((m) => [m.id, m.nombre]))
    const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
    const declaracionPorId = new Map(declaraciones.map((d) => [d.id, d]))

    const lista: Reporte[] = [
      {
        id: 'declaraciones',
        titulo: 'Declaraciones presentadas',
        descripcion: 'Todas las declaraciones presentadas en el rango, con su liquidación, pago y revisión.',
        porFechas: true,
        filas: [
          ['Municipio', 'Radicado', 'N.º de factura', 'Impuesto', 'Periodo', 'Tipo', 'Declarante', 'Documento', 'Presentación', 'Vencimiento', 'Total a pagar', 'Pagado', 'Estado de pago', 'Revisión'],
          ...declaraciones
            .filter((d) => enRango(d.fechaPresentacion))
            .map((d) => {
              const ins = porId.get(d.inscripcionId)
              return [
                nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
                etiquetaTipoDeclaracion[d.tipo], ins?.nombre ?? '', documento(ins), d.fechaPresentacion, d.fechaVencimiento, d.totalAPagar,
                totalPagado(d.id, pagos), etiquetaEstadoPago[estadoPago(d, pagos)], etiquetaEstadoRevision[d.estadoRevision],
              ]
            }),
        ],
      },
      {
        id: 'recaudo',
        titulo: 'Recaudo',
        descripcion: 'Los pagos recibidos en el rango, uno por fila, con la declaración que pagan.',
        porFechas: true,
        filas: [
          ['Municipio', 'Fecha de pago', 'Radicado', 'N.º de factura', 'Impuesto', 'Periodo', 'Declarante', 'Documento', 'Medio de pago', 'Valor'],
          ...pagos.flatMap((p) => {
            const d = declaracionPorId.get(p.declaracionId)
            if (!d || !enRango(p.fecha)) return []
            const ins = porId.get(d.inscripcionId)
            return [[
              nombreMunicipio.get(d.municipioId) ?? '', p.fecha, d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto],
              etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo), ins?.nombre ?? '', documento(ins), p.medio, p.valor,
            ]]
          }),
        ],
      },
      {
        id: 'cartera',
        titulo: 'Cartera pendiente',
        descripcion: 'Declaraciones vigentes con saldo por pagar, al día de hoy.',
        porFechas: false,
        filas: [
          ['Municipio', 'Radicado', 'N.º de factura', 'Impuesto', 'Periodo', 'Declarante', 'Documento', 'Vencimiento', 'Total a pagar', 'Pagado', 'Saldo', 'Estado de pago'],
          ...declaraciones.flatMap((d) => {
            const pagado = totalPagado(d.id, pagos)
            if (reemplazadas.has(d.id) || d.totalAPagar <= 0 || pagado >= d.totalAPagar) return []
            const ins = porId.get(d.inscripcionId)
            return [[
              nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
              ins?.nombre ?? '', documento(ins), d.fechaVencimiento, d.totalAPagar, pagado, d.totalAPagar - pagado, etiquetaEstadoPago[estadoPago(d, pagos)],
            ]]
          }),
        ],
      },
    ]

    // El RIT solo existe donde el municipio lo tiene en el aplicativo.
    if (ritVisible(municipios, municipioId)) {
      lista.push({
        id: 'rit',
        titulo: 'Inscritos en el RIT',
        descripcion: 'Inscripciones con sus datos de contacto, calidades y actividad principal, al día de hoy.',
        porFechas: false,
        filas: [
          ['Municipio', 'N.º de RIT', 'Nombre o razón social', 'Documento', 'Tipo de persona', 'Estado', 'Calidades', 'Actividad principal', 'Dirección', 'Teléfono', 'Correo'],
          ...inscripciones.filter(conRit(municipios)).map((i) => {
            const principal = i.actividades.find((a) => a.principal)
            return [
              nombreMunicipio.get(i.municipioId) ?? '', i.numeroRit, i.nombre, documento(i), etiquetaTipoPersona[i.tipoPersona], etiquetaEstadoInscripcion[i.estado],
              i.calidades.map((c) => etiquetaCalidad[c.calidad]).join(', '), principal ? `${principal.ciiu} ${principal.descripcion}` : '', i.direccion, i.telefono, i.correo,
            ]
          }),
        ],
      })
    }
    return lista
  }, [declaraciones, todasInscripciones, pagos, municipios, municipioId, desde, hasta])

  if (!puede(usuario?.rol, 'verReportes')) return <Navigate to="/" replace />

  const descargar = (r: Reporte) =>
    descargarCsv(r.filas, r.porFechas ? `reporte_${r.id}_${desde}_a_${hasta}.csv` : `reporte_${r.id}_${hoy()}.csv`)

  return (
    <>
      <PageHeader titulo="Reportes" descripcion="Informes del municipio para descargar en Excel (CSV)." />

      <Card>
        <CardHeader titulo="Rango de fechas" descripcion="Aplica a las declaraciones (por fecha de presentación) y al recaudo (por fecha de pago)." />
        <div className="grid gap-4 p-5 sm:max-w-md sm:grid-cols-2">
          <Campo etiqueta="Desde" error={desde > hasta ? 'Debe ser anterior a la fecha final.' : undefined}>
            <Input type="date" max={hasta || hoy()} value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Campo>
          <Campo etiqueta="Hasta">
            <Input type="date" min={desde} max={hoy()} value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </Campo>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader titulo="Informes" />
        <ul className="divide-y divide-slate-100">
          {reportes.map((r) => {
            const registros = r.filas.length - 1
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{r.titulo}</p>
                  <p className="text-sm text-slate-500">{r.descripcion}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.porFechas && rangoInvalido ? 'Corrige el rango de fechas' : `${registros} ${registros === 1 ? 'registro' : 'registros'}`}
                  </p>
                </div>
                <Boton variante="secundario" disabled={registros === 0 || (r.porFechas && rangoInvalido)} onClick={() => descargar(r)}>
                  <Download className="size-4" aria-hidden /> Descargar
                </Boton>
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
