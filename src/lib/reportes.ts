// Reportes del municipio: sus columnas (para la tabla y el Excel), sus filas y sus gráficas por categoría.
import type { Barra } from '../components/organisms/GraficoBarras'
import type { Declaracion, EstadoAprobacion, Impuesto, Inscripcion, Municipio, Pago } from '../types'
import {
  etiquetaCalidad,
  etiquetaEstadoAprobacion,
  etiquetaEstadoInscripcion,
  etiquetaEstadoPago,
  etiquetaImpuesto,
  etiquetaPeriodo,
  etiquetaTipoDeclaracion,
  etiquetaTipoPersona,
  formatoDocumento,
  MESES,
} from './formato'
import { estadoPago, sePuedePagar, totalPagado } from './reglas'
import type { SituacionAprobacion } from './reglas'
import { conRit, delMunicipio, impuestosVisibles } from './sesion'

export type IdReporte = 'declaraciones' | 'recaudo' | 'cartera' | 'rit'
export type Fila = (string | number)[]

export interface Columna {
  titulo: string
  /** Ancho en Excel, en caracteres. */
  ancho: number
  formato?: 'pesos' | 'fecha'
}

export interface Grafica {
  titulo: string
  descripcion?: string
  formato: 'cantidad' | 'pesos'
  barras: Barra[]
}

export interface Reporte {
  id: IdReporte
  pestana: string
  titulo: string
  descripcion: string
  porFechas: boolean
}

export const REPORTES: Reporte[] = [
  { id: 'declaraciones', pestana: 'Declaraciones', titulo: 'Declaraciones presentadas', descripcion: 'Declaraciones presentadas en el rango, con su liquidación y su pago.', porFechas: true },
  { id: 'recaudo', pestana: 'Recaudo', titulo: 'Recaudo', descripcion: 'Pagos recibidos en el rango, uno por fila, con la declaración que pagan.', porFechas: true },
  { id: 'cartera', pestana: 'Cartera', titulo: 'Cartera pendiente', descripcion: 'Declaraciones vigentes con saldo por pagar, al día de hoy.', porFechas: false },
  { id: 'rit', pestana: 'RIT', titulo: 'Inscritos en el RIT', descripcion: 'Inscripciones con sus datos de contacto, calidades y actividad principal, al día de hoy.', porFechas: false },
]

const MUNICIPIO: Columna = { titulo: 'Municipio', ancho: 16 }
const RADICADO: Columna = { titulo: 'Radicado', ancho: 18 }
const FACTURA: Columna = { titulo: 'N.º de factura', ancho: 14 }
const IMPUESTO: Columna = { titulo: 'Impuesto', ancho: 13 }
const PERIODO: Columna = { titulo: 'Periodo', ancho: 20 }
const DECLARANTE: Columna = { titulo: 'Declarante', ancho: 36 }
const DOCUMENTO: Columna = { titulo: 'Documento', ancho: 18 }
const VENCIMIENTO: Columna = { titulo: 'Vencimiento', ancho: 13, formato: 'fecha' }
const TOTAL: Columna = { titulo: 'Total a pagar', ancho: 16, formato: 'pesos' }
const PAGADO: Columna = { titulo: 'Pagado', ancho: 16, formato: 'pesos' }
const ESTADO_PAGO: Columna = { titulo: 'Estado de pago', ancho: 24 }
const APROBACION: Columna = { titulo: 'Aprobación', ancho: 26 }

export const COLUMNAS: Record<IdReporte, Columna[]> = {
  declaraciones: [
    MUNICIPIO, RADICADO, FACTURA, IMPUESTO, PERIODO, { titulo: 'Tipo', ancho: 12 }, DECLARANTE, DOCUMENTO,
    { titulo: 'Presentación', ancho: 13, formato: 'fecha' }, VENCIMIENTO, TOTAL, PAGADO, ESTADO_PAGO, APROBACION,
  ],
  recaudo: [
    MUNICIPIO, { titulo: 'Fecha de pago', ancho: 13, formato: 'fecha' }, RADICADO, FACTURA, IMPUESTO, PERIODO, DECLARANTE, DOCUMENTO,
    { titulo: 'Medio de pago', ancho: 18 }, { titulo: 'Valor', ancho: 16, formato: 'pesos' },
  ],
  cartera: [
    MUNICIPIO, RADICADO, FACTURA, IMPUESTO, PERIODO, DECLARANTE, DOCUMENTO, VENCIMIENTO, TOTAL, PAGADO,
    { titulo: 'Saldo', ancho: 16, formato: 'pesos' }, ESTADO_PAGO,
  ],
  rit: [
    MUNICIPIO, { titulo: 'N.º de RIT', ancho: 12 }, { titulo: 'Nombre o razón social', ancho: 36 }, DOCUMENTO, { titulo: 'Tipo de persona', ancho: 18 },
    { titulo: 'Estado', ancho: 13 }, { titulo: 'Calidades', ancho: 30 }, { titulo: 'Actividad principal', ancho: 50 }, { titulo: 'Dirección', ancho: 30 },
    { titulo: 'Teléfono', ancho: 14 }, { titulo: 'Correo', ancho: 30 },
  ],
}

/** Sin declaraciones con aprobación previa, el reporte de declaraciones va sin esa columna, que es la última. */
export const SIN_APROBACION = COLUMNAS.declaraciones.slice(0, -1)

const hoy = () => new Date().toISOString().slice(0, 10)
const documento = (i: Inscripcion | undefined) => (i ? formatoDocumento(i) : '')
const DIA = 24 * 60 * 60 * 1000

/** Mismos colores que las series de la gráfica de recaudo en Inicio. */
const CLASE_IMPUESTO: Record<Impuesto, string> = { ica: 'bg-serie-ica', reteica: 'bg-serie-reteica', autorretencion: 'bg-serie-autorretencion' }

/** Cuenta o suma por categoría, en el orden de las etiquetas. */
function agrupar<T, K extends string>(items: T[], etiquetas: Record<K, string>, clave: (item: T) => K, valor: (item: T) => number = () => 1): Barra[] {
  return (Object.keys(etiquetas) as K[]).map((k) => ({
    etiqueta: etiquetas[k],
    valor: items.filter((x) => clave(x) === k).reduce((s, x) => s + valor(x), 0),
  }))
}

/** Antigüedad de la deuda según los días desde el vencimiento. */
function antiguedad(vencimiento: string) {
  const dias = Math.floor((Date.parse(hoy()) - Date.parse(vencimiento)) / DIA)
  if (dias <= 0) return 'por_vencer'
  if (dias <= 30) return 'hasta_30'
  if (dias <= 90) return 'hasta_90'
  if (dias <= 180) return 'hasta_180'
  return 'mas_180'
}

const etiquetaAntiguedad: Record<ReturnType<typeof antiguedad>, string> = {
  por_vencer: 'Por vencer',
  hasta_30: 'Vencida hace 1 a 30 días',
  hasta_90: 'Vencida hace 31 a 90 días',
  hasta_180: 'Vencida hace 91 a 180 días',
  mas_180: 'Vencida hace más de 180 días',
}

/** Los estados de pago en que una declaración puede quedar con saldo. */
const ESTADOS_CON_SALDO = { sin_pago: etiquetaEstadoPago.sin_pago, parcial: etiquetaEstadoPago.parcial, ineficaz: etiquetaEstadoPago.ineficaz }

interface Fuente {
  /** Las del municipio que se está viendo, solo de los impuestos activos. */
  declaraciones: Declaracion[]
  /** Todas: aquí se filtran por municipio. */
  inscripciones: Inscripcion[]
  pagos: Pago[]
  municipios: Municipio[]
  municipioId: string | null
  desde: string
  hasta: string
  rangoInvalido: boolean
  aprobacion: (d: Declaracion) => SituacionAprobacion | undefined
  estadoAprobacion: EstadoAprobacion | 'no_aplica' | ''
}

/** Filas y gráficas de cada reporte. Declaraciones y recaudo van por rango de fechas; cartera y RIT, al día de hoy. */
export function armarReportes(fuente: Fuente): Record<IdReporte, { filas: Fila[]; graficas: Grafica[] }> {
  const { declaraciones, inscripciones: todas, pagos, municipios, municipioId, desde, hasta, rangoInvalido, aprobacion, estadoAprobacion } = fuente
  const enRango = (fecha: string) => !rangoInvalido && fecha >= desde && fecha <= hasta
  const inscripciones = delMunicipio(todas, municipioId)
  const porId = new Map(inscripciones.map((i) => [i.id, i]))
  const nombreMunicipio = new Map(municipios.map((m) => [m.id, m.nombre]))
  const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
  const declaracionPorId = new Map(declaraciones.map((d) => [d.id, d]))
  const visibles = impuestosVisibles(municipios, municipioId)
  const porImpuesto = <T,>(items: T[], impuesto: (item: T) => Impuesto, valor: (item: T) => number = () => 1): Barra[] =>
    visibles.map((i) => ({
      etiqueta: etiquetaImpuesto[i],
      valor: items.filter((x) => impuesto(x) === i).reduce((s, x) => s + valor(x), 0),
      clase: CLASE_IMPUESTO[i],
    }))

  const presentadas = declaraciones
    .filter((d) => enRango(d.fechaPresentacion))
    .map((d) => ({ d, ins: porId.get(d.inscripcionId), pagado: totalPagado(d.id, pagos), estado: estadoPago(d, pagos), a: aprobacion(d) }))
    .filter((f) => !estadoAprobacion || (f.a?.estado ?? 'no_aplica') === estadoAprobacion)

  const recibidos = pagos.flatMap((p) => {
    const d = declaracionPorId.get(p.declaracionId)
    return d && enRango(p.fecha) ? [{ p, d, ins: porId.get(d.inscripcionId) }] : []
  })
  const medios = [...new Set(recibidos.map(({ p }) => p.medio))].sort()
  const meses = [...new Set(recibidos.map(({ p }) => p.fecha.slice(0, 7)))].sort()

  const cartera = declaraciones.flatMap((d) => {
    const pagado = totalPagado(d.id, pagos)
    // Lo que aún espera la aprobación previa no se puede pagar: no es cartera.
    if (reemplazadas.has(d.id) || d.totalAPagar <= 0 || pagado >= d.totalAPagar || !sePuedePagar(aprobacion(d))) return []
    return [{ d, ins: porId.get(d.inscripcionId), pagado, saldo: d.totalAPagar - pagado, estado: estadoPago(d, pagos) }]
  })

  const inscritos = inscripciones.filter(conRit(municipios))

  return {
    declaraciones: {
      filas: presentadas.map(({ d, ins, pagado, estado, a }) => [
        nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
        etiquetaTipoDeclaracion[d.tipo], ins?.nombre ?? '', documento(ins), d.fechaPresentacion, d.fechaVencimiento, d.totalAPagar,
        pagado, etiquetaEstadoPago[estado], a ? etiquetaEstadoAprobacion[a.estado] : 'No aplica',
      ]),
      graficas: [
        { titulo: 'Por impuesto', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: porImpuesto(presentadas, (f) => f.d.impuesto) },
        { titulo: 'Por estado de pago', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: agrupar(presentadas, etiquetaEstadoPago, (f) => f.estado) },
        { titulo: 'Por tipo de declaración', descripcion: 'Cantidad de declaraciones.', formato: 'cantidad', barras: agrupar(presentadas, etiquetaTipoDeclaracion, (f) => f.d.tipo) },
      ],
    },
    recaudo: {
      filas: recibidos.map(({ p, d, ins }) => [
        nombreMunicipio.get(d.municipioId) ?? '', p.fecha, d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto],
        etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo), ins?.nombre ?? '', documento(ins), p.medio, p.valor,
      ]),
      graficas: [
        { titulo: 'Por impuesto', descripcion: 'Valor recaudado.', formato: 'pesos', barras: porImpuesto(recibidos, (f) => f.d.impuesto, (f) => f.p.valor) },
        {
          titulo: 'Por medio de pago',
          descripcion: 'Valor recaudado.',
          formato: 'pesos',
          barras: medios.map((m) => ({ etiqueta: m, valor: recibidos.filter((f) => f.p.medio === m).reduce((s, f) => s + f.p.valor, 0) })),
        },
        {
          titulo: 'Por mes',
          descripcion: 'Valor recaudado según la fecha de pago.',
          formato: 'pesos',
          barras: meses.map((m) => ({
            etiqueta: `${MESES[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`,
            valor: recibidos.filter((f) => f.p.fecha.startsWith(m)).reduce((s, f) => s + f.p.valor, 0),
          })),
        },
      ],
    },
    cartera: {
      filas: cartera.map(({ d, ins, pagado, saldo, estado }) => [
        nombreMunicipio.get(d.municipioId) ?? '', d.numero, d.numeroFactura, etiquetaImpuesto[d.impuesto], etiquetaPeriodo(d.impuesto, d.vigencia, d.periodo),
        ins?.nombre ?? '', documento(ins), d.fechaVencimiento, d.totalAPagar, pagado, saldo, etiquetaEstadoPago[estado],
      ]),
      graficas: [
        { titulo: 'Por impuesto', descripcion: 'Saldo por pagar.', formato: 'pesos', barras: porImpuesto(cartera, (f) => f.d.impuesto, (f) => f.saldo) },
        {
          titulo: 'Por estado de pago',
          descripcion: 'Saldo por pagar.',
          formato: 'pesos',
          barras: agrupar(cartera, ESTADOS_CON_SALDO, (f) => f.estado as keyof typeof ESTADOS_CON_SALDO, (f) => f.saldo),
        },
        { titulo: 'Por antigüedad', descripcion: 'Saldo según los días desde el vencimiento.', formato: 'pesos', barras: agrupar(cartera, etiquetaAntiguedad, (f) => antiguedad(f.d.fechaVencimiento), (f) => f.saldo) },
      ],
    },
    rit: {
      filas: inscritos.map((i) => {
        const principal = i.actividades.find((a) => a.principal)
        return [
          nombreMunicipio.get(i.municipioId) ?? '', i.numeroRit, i.nombre, documento(i), etiquetaTipoPersona[i.tipoPersona], etiquetaEstadoInscripcion[i.estado],
          i.calidades.map((c) => etiquetaCalidad[c.calidad]).join(', '), principal ? `${principal.ciiu} ${principal.descripcion}` : '', i.direccion, i.telefono, i.correo,
        ]
      }),
      graficas: [
        {
          titulo: 'Por calidad',
          descripcion: 'Una inscripción puede tener varias calidades.',
          formato: 'cantidad',
          barras: (Object.keys(etiquetaCalidad) as (keyof typeof etiquetaCalidad)[]).map((c) => ({
            etiqueta: etiquetaCalidad[c],
            valor: inscritos.filter((i) => i.calidades.some((q) => q.calidad === c)).length,
          })),
        },
        { titulo: 'Por estado', descripcion: 'Cantidad de inscripciones.', formato: 'cantidad', barras: agrupar(inscritos, etiquetaEstadoInscripcion, (i) => i.estado) },
        { titulo: 'Por tipo de persona', descripcion: 'Cantidad de inscripciones.', formato: 'cantidad', barras: agrupar(inscritos, etiquetaTipoPersona, (i) => i.tipoPersona) },
      ],
    },
  }
}
