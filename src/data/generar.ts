// Genera los datos de la demo con una semilla fija: siempre salen los mismos.
import { MESES_POR_PERIODO } from '../constants'
import { vencimientoPara } from '../lib/calendario'
import { calcularOmisos } from '../lib/omisos'
import { etiquetaCalidad, formatoPesos, nombreCompleto } from '../lib/formato'
import {
  CODIGO_PAGADO_CON_LA_CORREGIDA,
  limiteConsignacion,
  limiteCorreccionABaja,
  porcentajeProntoPago,
  redondearMil,
  sancionExtemporaneidad,
  sumarDiasHabiles,
  UVT,
  valorLiquidado,
} from '../lib/reglas'
import type {
  Archivo,
  Calidad,
  Cheque,
  CalidadInscrita,
  ConfigMunicipio,
  Datos,
  DatosRit,
  Declaracion,
  DestinoEmplazamiento,
  Emplazamiento,
  EstadoInscripcion,
  Firmante,
  Impuesto,
  Inscripcion,
  Municipio,
  Novedad,
  Omiso,
  Pago,
  Periodicidad,
  RecaudoMensual,
  Renglon,
  SolicitudCorreccion,
  Tarifa,
  TipoPersona,
} from '../types'
import { diferenciaDias, sumarMeses } from '../utils'
import {
  ACTIVIDADES,
  ACTIVIDADES_POR_VIGENCIA,
  APELLIDOS,
  CALLES,
  CONFIGURACIONES,
  EMPRESAS,
  MARCAS,
  MUNICIPIOS,
  NOMBRES,
  USUARIOS,
} from './catalogos'
import { crearAzar, fechaAleatoria, sumarDias } from './azar'
import type { Azar } from './azar'
import { generarBitacora } from './bitacora'

const INSCRIPCIONES_POR_MUNICIPIO = 40
/** Donde la ReteICA no se valida contra el RIT, sociedades que la declaran sin haberse inscrito. */
const AGENTES_NO_INSCRITOS = 3
const FECHA_DEMO = '2026-10-21'

const menor = (a: string, b: string) => (a < b ? a : b)

/** Los vencimientos de un formulario en el año gravable, según el calendario que trae la demo para el municipio. */
const formularioDe = (cfg: ConfigMunicipio, impuesto: Impuesto, vigencia: number) =>
  cfg.calendarioTributario.porVigencia.find((c) => c.vigencia === vigencia)![impuesto]

/** Vencimiento del ICA anual del año gravable para el contribuyente: la fecha única o la de su último dígito. */
function vencimientoIca(cfg: ConfigMunicipio, vigencia: number, documento: string) {
  const f = formularioDe(cfg, 'ica', vigencia)
  return vencimientoPara(f, f.periodos[0], documento)!
}

/**
 * Periodos de ReteICA o AutoReteICA del año gravable que ya vencieron a la fecha de la demo para el contribuyente, con
 * la periodicidad y el vencimiento (el de su último dígito, si el calendario los separa) del calendario.
 */
function periodosVencidos(cfg: ConfigMunicipio, impuesto: Impuesto, vigencia: number, documento: string) {
  const f = formularioDe(cfg, impuesto, vigencia)
  return f.periodos.flatMap((p) => {
    const vencimiento = vencimientoPara(f, p, documento)
    return vencimiento && vencimiento <= FECHA_DEMO ? [{ periodicidad: f.periodicidad, periodo: p.periodo, vencimiento }] : []
  })
}

/** La calidad del RIT que obliga a presentar cada formulario de retención. */
const CALIDAD_RETENCION = { reteica: 'agente_retenedor', autorretencion: 'autorretenedor' } as const

/** Cómo se llama la duración del periodo en los renglones: "Base gravable del mes". */
const DURACION: Record<Periodicidad, string> = { anual: 'año', mensual: 'mes', bimestral: 'bimestre', trimestral: 'trimestre' }

/**
 * Cada declaración sorteaba un estado de revisión, que ya no existe. Se conservan esos sorteos
 * para que el resto de los datos de la demo no cambie.
 */
function sorteoDeRevision(az: Azar, probPendiente: number) {
  if (!az.prob(probPendiente) && az.prob(0.15)) az.num()
}

// --- RIT ---

function nombreSujeto(az: Azar, tipo: TipoPersona) {
  switch (tipo) {
    case 'natural':
      return `${az.elegir(NOMBRES)} ${az.elegir(APELLIDOS)} ${az.elegir(APELLIDOS)}`
    case 'juridica':
      return `${az.elegir(EMPRESAS)} ${az.elegir(MARCAS)} S.A.S.`
    case 'consorcio':
      return `Consorcio Vial ${az.elegir(MARCAS)}`
    case 'union_temporal':
      return `Unión Temporal ${az.elegir(MARCAS)} ${az.entero(2021, 2025)}`
    case 'patrimonio_autonomo':
      return `Patrimonio Autónomo Fideicomiso ${az.elegir(MARCAS)}`
  }
}

function nombreArchivo(nombre: string) {
  const base = nombre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
  return `${base}.pdf`
}

function archivoAleatorio(az: Azar, nombre: string, fecha: string): Archivo {
  return { nombre: nombreArchivo(nombre), tamano: az.entero(80_000, 2_400_000), fechaCarga: fecha }
}

const ANEXOS: Record<Impuesto, string[]> = {
  ica: ['Anexo de ingresos por actividad', 'Certificados de retención de ICA', 'Soporte de deducciones y exenciones'],
  reteica: ['Relación de retenciones practicadas'],
  autorretencion: ['Relación de bases de autorretención'],
}

/** Documento que acredita la calidad, en la inscripción o en la actualización que la agrega. */
const SOPORTE_CALIDAD: Partial<Record<Calidad, string>> = {
  agente_retenedor: 'Acto que acredita la calidad de agente retenedor',
  autorretenedor: 'Resolución de designación como autorretenedor',
}

function soportesRequeridos(tipo: TipoPersona, calidades: Calidad[]) {
  const lista =
    tipo === 'natural'
      ? ['Formulario RIT', 'Copia del RUT', 'Copia de la cédula']
      : ['Formulario RIT', 'Copia del RUT', 'Certificado de existencia y representación legal (máx. 30 días)', 'Cédula del representante legal']
  if (calidades.includes('agente_retenedor')) lista.push(SOPORTE_CALIDAD.agente_retenedor!)
  if (calidades.includes('autorretenedor')) lista.push(SOPORTE_CALIDAD.autorretenedor!)
  return lista
}

const direccionAleatoria = (az: Azar) => `${az.elegir(CALLES)} ${az.entero(1, 120)} # ${az.entero(1, 99)}-${az.entero(1, 99)}`
const telefonoAleatorio = (az: Azar) => `3${az.entero(10, 25)} ${az.entero(100, 999)} ${az.entero(1000, 9999)}`

type Motivo = { motivo: string; soportes: string[]; noAplicaANaturales?: boolean }

/** Motivos de actualización: el documento que pide cada uno y cómo estaba el dato antes del cambio. */
const MOTIVOS_ACTUALIZACION: (Motivo & { antes: (az: Azar, d: DatosRit) => Partial<DatosRit> })[] = [
  { motivo: 'Cambio de dirección del establecimiento', soportes: ['Copia del RUT actualizado'], antes: (az) => ({ direccion: direccionAleatoria(az) }) },
  {
    motivo: 'Cambio del correo de notificación',
    soportes: [],
    antes: (az, d) => ({ correo: d.correo.replace(/^\D+/, az.elegir(['gerencia', 'admin', 'tesoreria', 'info'].filter((p) => !d.correo.startsWith(p)))) }),
  },
  { motivo: 'Actualización de datos de contacto', soportes: [], antes: (az) => ({ telefono: telefonoAleatorio(az) }) },
  {
    motivo: 'Cambio de representante legal',
    soportes: ['Certificado de existencia y representación legal (máx. 30 días)', 'Cédula del representante legal'],
    noAplicaANaturales: true,
    antes: (az) => ({ representanteLegal: `${az.elegir(NOMBRES)} ${az.elegir(APELLIDOS)}` }),
  },
]

const MOTIVOS_CANCELACION: Motivo[] = [
  { motivo: 'Cierre definitivo del establecimiento', soportes: [] },
  { motivo: 'Traslado de la actividad a otro municipio', soportes: ['Copia del RUT actualizado'] },
  { motivo: 'Venta del establecimiento de comercio', soportes: ['Contrato de compraventa del establecimiento'] },
  { motivo: 'Liquidación de la sociedad', soportes: ['Certificado de liquidación de la sociedad'], noAplicaANaturales: true },
]

const semilla = (texto: string) => [...texto].reduce((h, c) => Math.imul(h, 31) + c.charCodeAt(0), 7)

/**
 * Llena lo que el contribuyente diligenció en cada solicitud del RIT. La inscripción tiene los datos del último
 * formulario aprobado; hacia atrás, cada actualización aprobada deshace su cambio. Agrega actualizaciones para que
 * haya historiales largos: las calidades que llegaron después de inscribirse y, en las canceladas, al menos dos.
 * Usa su propio azar para no cambiar el resto de los datos.
 */
function agregarFormularios(ins: Inscripcion) {
  const az = crearAzar(semilla(ins.id))
  const esNatural = ins.tipoPersona === 'natural'
  const aplica = (m: Motivo) => !esNatural || !m.noAplicaANaturales
  const { novedades } = ins
  const inscripcion = novedades[0]
  const cargados = (nombres: string[], fecha: string) => nombres.map((nombre) => ({ nombre, entregado: true, archivo: archivoAleatorio(az, nombre, fecha) }))
  const aprobada = (fecha: string, descripcion: string, calidad?: Calidad) =>
    novedades.push({
      id: '', tipo: 'actualizacion', fecha, descripcion, calidad, estado: 'aprobada', revisadaPor: inscripcion.revisadaPor, fechaRevision: sumarDias(fecha, 5), soportes: [],
    })

  if (ins.estado === 'activa' || ins.estado === 'cancelada') {
    for (const c of ins.calidades) {
      if (c.calidad !== 'contribuyente' && c.desde > inscripcion.fecha) {
        aprobada(sumarDias(c.desde, az.entero(5, 40)), `Agrega la calidad de ${etiquetaCalidad[c.calidad].toLowerCase()} (${c.acto})`, c.calidad)
      }
    }
    const tope = novedades.find((n) => n.tipo === 'cancelacion' || n.estado === 'pendiente')?.fecha ?? '2026-08-31'
    const desde = sumarDias(inscripcion.fecha, 60)
    const hasta = sumarDias(tope, -20)
    let faltan = ins.estado === 'cancelada' ? 2 - novedades.filter((n) => n.tipo === 'actualizacion').length : az.prob(0.25) ? 1 : 0
    while (faltan-- > 0 && desde < hasta) aprobada(fechaAleatoria(az, desde, hasta), az.elegir(MOTIVOS_ACTUALIZACION.filter(aplica)).motivo)
    novedades.sort((a, b) => a.fecha.localeCompare(b.fecha))
    novedades.forEach((n, i) => (n.id = `${ins.id}-n${i + 1}`))
  }

  let vigente: DatosRit = structuredClone({
    tipoPersona: ins.tipoPersona, tipoDocumento: ins.tipoDocumento, documento: ins.documento, dv: ins.dv, nombre: ins.nombre,
    representanteLegal: ins.representanteLegal, direccion: ins.direccion, telefono: ins.telefono, correo: ins.correo,
    establecimientos: ins.establecimientos, contador: ins.contador,
    fechaInicioActividades: ins.fechaInicioActividades, regimenSimple: ins.regimenSimple, actividades: ins.actividades, calidades: ins.calidades,
  })
  for (const n of [...novedades].reverse()) {
    if (n.tipo === 'cancelacion') {
      const m = az.elegir(MOTIVOS_CANCELACION.filter(aplica))
      n.cancelacion = { fechaCese: n.fecha, motivo: m.motivo }
      n.soportes = cargados(['Solicitud de cancelación firmada', ...m.soportes], n.fecha)
    } else if (n.tipo === 'actualizacion' && n.estado === 'pendiente') {
      // Aún no se aplica: pide lo vigente más la calidad nueva.
      n.datos = structuredClone(vigente)
      n.datos.calidades.push({ calidad: n.calidad!, desde: n.fecha, acto: /\(([^)]+)\)/.exec(n.descripcion)?.[1] })
      n.soportes = cargados([SOPORTE_CALIDAD[n.calidad!]!], n.fecha)
    } else if (n.tipo === 'actualizacion') {
      n.datos = structuredClone(vigente)
      const motivo = MOTIVOS_ACTUALIZACION.find((m) => m.motivo === n.descripcion)
      n.soportes = cargados(n.calidad ? [SOPORTE_CALIDAD[n.calidad]!] : motivo!.soportes, n.fecha)
      vigente = n.calidad ? { ...vigente, calidades: vigente.calidades.filter((c) => c.calidad !== n.calidad) } : { ...vigente, ...motivo!.antes(az, vigente) }
    } else {
      n.datos = structuredClone(vigente)
      const requeridos = soportesRequeridos(ins.tipoPersona, vigente.calidades.map((c) => c.calidad))
      n.soportes = ins.soportes.filter((s) => requeridos.includes(s.nombre))
    }
  }
}

/**
 * Establecimientos en el municipio y contador o revisor fiscal del inscrito. Pocas personas naturales están obligadas
 * a llevar contabilidad, y algunas sociedades deben tener revisor fiscal. Usa su propio azar para no cambiar el resto
 * de los datos.
 */
function datosContables(id: string, tipo: TipoPersona): Pick<Inscripcion, 'establecimientos' | 'contador'> {
  const az = crearAzar(semilla(`${id}-contable`))
  const establecimientos = az.elegir(tipo === 'natural' ? [0, 1, 1, 1, 1, 1, 1, 1, 2] : tipo === 'juridica' ? [1, 1, 1, 2, 2, 3, 4] : [0, 0, 1])
  if (tipo === 'natural' && !az.prob(0.3)) return { establecimientos }
  const extranjero = az.prob(0.05)
  return {
    establecimientos,
    contador: {
      cargo: tipo === 'juridica' && az.prob(0.35) ? 'revisor_fiscal' : 'contador',
      tipoDocumento: extranjero ? 'CE' : 'CC',
      documento: String(extranjero ? az.entero(100_000, 9_999_999) : az.entero(10_000_000, 1_199_999_999)),
      nombre: `${az.elegir(NOMBRES)} ${az.elegir(APELLIDOS)} ${az.elegir(APELLIDOS)}`,
      tarjetaProfesional: `${az.entero(10_000, 299_999)}-T`,
    },
  }
}

function generarInscripcion(az: Azar, municipioId: string, n: number): Inscripcion {
  const id = `${municipioId}-i${n}`
  const r = az.num()
  const tipoPersona: TipoPersona =
    r < 0.45 ? 'natural' : r < 0.9 ? 'juridica' : r < 0.94 ? 'consorcio' : r < 0.97 ? 'union_temporal' : 'patrimonio_autonomo'
  const esNatural = tipoPersona === 'natural'
  const e = az.num()
  const estado: EstadoInscripcion = e < 0.78 ? 'activa' : e < 0.9 ? 'en_revision' : e < 0.95 ? 'rechazada' : 'cancelada'
  const fechaInicio = estado === 'en_revision' ? fechaAleatoria(az, '2026-07-01', '2026-10-15') : fechaAleatoria(az, '2008-01-01', '2024-06-30')

  const opciones = esNatural ? ACTIVIDADES.filter((a) => a.sector !== 'financiero') : ACTIVIDADES
  const principal = az.elegir(opciones)
  const actividades = [{ ciiu: principal.ciiu, descripcion: principal.descripcion, principal: true }]
  if (az.prob(0.3)) {
    const otra = az.elegir(opciones.filter((a) => a.ciiu !== principal.ciiu))
    actividades.push({ ciiu: otra.ciiu, descripcion: otra.descripcion, principal: false })
  }

  const calidades: CalidadInscrita[] = [{ calidad: 'contribuyente', desde: fechaInicio }]
  if (!esNatural && az.prob(0.35)) {
    const anio = az.entero(2019, 2025)
    calidades.push({ calidad: 'agente_retenedor', desde: `${anio}-01-01`, acto: `Resolución ${az.entero(100, 999)} de ${anio}` })
  }
  if (tipoPersona === 'juridica' && az.prob(0.2)) {
    const anio = az.entero(2018, 2025)
    calidades.push({ calidad: 'autorretenedor', desde: `${anio}-01-01`, acto: `Resolución ${az.entero(100, 999)} de ${anio}` })
  }
  const regimenSimple = calidades.length === 1 && az.prob(esNatural ? 0.35 : 0.12)

  const revisores = USUARIOS.filter((u) => u.municipioId === municipioId && u.rol === 'funcionario')
  const revisor = nombreCompleto(az.elegir(revisores))
  // Hasta 4 meses: con plazos de 2 y 3 meses, algunas de las recientes llegan tarde.
  const fechaInscripcion = sumarDias(fechaInicio, az.entero(5, 120))
  const novedades: Novedad[] = []
  const novedad = (datos: Omit<Novedad, 'id' | 'soportes'>) => novedades.push({ id: `${id}-n${novedades.length + 1}`, soportes: [], ...datos })

  if (estado === 'en_revision') {
    novedad({ tipo: 'inscripcion', fecha: menor(fechaInscripcion, FECHA_DEMO), descripcion: 'Solicitud de inscripción en el RIT', estado: 'pendiente' })
  } else if (estado === 'rechazada') {
    novedad({
      tipo: 'inscripcion', fecha: fechaInscripcion, descripcion: 'Solicitud de inscripción en el RIT', estado: 'rechazada',
      revisadaPor: revisor, fechaRevision: sumarDias(fechaInscripcion, 8),
      observacion: az.elegir(['El certificado de existencia tiene más de 30 días.', 'Falta la copia del RUT actualizada.']),
      documentosRespuesta: [archivoAleatorio(az, 'Oficio de respuesta a la solicitud de inscripción', sumarDias(fechaInscripcion, 8))],
    })
  } else {
    novedad({ tipo: 'inscripcion', fecha: fechaInscripcion, descripcion: 'Solicitud de inscripción en el RIT', estado: 'aprobada', revisadaPor: revisor, fechaRevision: sumarDias(fechaInscripcion, 6) })
    if (az.prob(0.3)) {
      const fecha = fechaAleatoria(az, sumarDias(fechaInscripcion, 90), '2026-01-31')
      const motivos = MOTIVOS_ACTUALIZACION.filter((m) => !esNatural || !m.noAplicaANaturales)
      novedad({ tipo: 'actualizacion', fecha, descripcion: az.elegir(motivos).motivo, estado: 'aprobada', revisadaPor: revisor, fechaRevision: sumarDias(fecha, 5) })
    }
    if (estado === 'cancelada') {
      const fecha = fechaAleatoria(az, '2026-02-01', '2026-08-31')
      novedad({ tipo: 'cancelacion', fecha, descripcion: 'Cese definitivo de actividades', estado: 'aprobada', revisadaPor: revisor, fechaRevision: sumarDias(fecha, 10) })
    } else if (!esNatural && !calidades.some((c) => c.calidad === 'agente_retenedor') && az.prob(0.12)) {
      novedad({
        tipo: 'actualizacion', fecha: fechaAleatoria(az, '2026-09-01', FECHA_DEMO), estado: 'pendiente', calidad: 'agente_retenedor',
        descripcion: `Solicita agregar la calidad de agente retenedor (Resolución ${az.entero(100, 999)} de 2026)`,
      })
    } else if (az.prob(0.05)) {
      novedad({ tipo: 'cancelacion', fecha: fechaAleatoria(az, '2026-09-01', FECHA_DEMO), descripcion: 'Reporta cese definitivo de actividades', estado: 'pendiente' })
    }
  }

  const soportes = soportesRequeridos(tipoPersona, calidades.map((c) => c.calidad)).map((nombre, i) => {
    const entregado = estado !== 'en_revision' || i === 0 || az.prob(0.75)
    return { nombre, entregado, archivo: entregado ? archivoAleatorio(az, nombre, fechaInicio) : undefined }
  })
  const documento = esNatural ? String(az.entero(10_000_000, 1_199_999_999)) : String(az.entero(900_100_000, 901_999_999))
  const nombre = nombreSujeto(az, tipoPersona)

  const inscripcion: Inscripcion = {
    id,
    municipioId,
    numeroRit: `${MUNICIPIOS.find((m) => m.id === municipioId)!.codigoDane}-${String(n).padStart(5, '0')}`,
    tipoPersona,
    tipoDocumento: esNatural ? 'CC' : 'NIT',
    documento,
    dv: esNatural ? undefined : String(az.entero(0, 9)),
    nombre,
    representanteLegal: esNatural ? undefined : `${az.elegir(NOMBRES)} ${az.elegir(APELLIDOS)}`,
    direccion: direccionAleatoria(az),
    telefono: telefonoAleatorio(az),
    correo: `contacto${n}@${esNatural ? 'correo' : 'empresa'}.demo`,
    ...datosContables(id, tipoPersona),
    fechaInicioActividades: fechaInicio,
    regimenSimple,
    actividades,
    calidades,
    estado,
    soportes,
    novedades,
  }
  agregarFormularios(inscripcion)
  return inscripcion
}

// --- Declaraciones ---

/** Lo que se escribe en la declaración sobre quien la presenta: el contribuyente, el declarante y el contador o revisor fiscal. */
type Diligenciado = Pick<Declaracion, 'contribuyente' | 'declarante' | 'contador'>

/** Cédula de una persona de la demo: la misma para la misma clave. Usa su propio azar para no cambiar el resto de los datos. */
const cedulaDe = (clave: string) => String(crearAzar(semilla(clave)).entero(10_000_000, 1_199_999_999))

/**
 * Lo que se escribe en la declaración: lo que el contribuyente tenía inscrito en el RIT el día que la presenta, así que
 * las declaraciones viejas conservan los datos de antes de una actualización. La persona natural se declara a sí misma;
 * por una empresa declara su representante legal. El número de establecimientos solo lo pide el formulario del ICA anual.
 */
function diligenciadoPor(ins: Inscripcion, fecha: string, impuesto: Impuesto): Diligenciado {
  const vigente = ins.novedades.findLast((n) => n.estado === 'aprobada' && n.datos && (n.fechaRevision ?? n.fecha) <= fecha)?.datos ?? ins
  const { tipoPersona, tipoDocumento, documento, dv, nombre, representanteLegal, direccion, telefono, correo, contador, establecimientos } = vigente
  const declarante: Firmante = representanteLegal
    ? { tipoDocumento: 'CC', documento: cedulaDe(`${ins.id}-${representanteLegal}`), nombre: representanteLegal }
    : { tipoDocumento: tipoDocumento === 'CE' ? 'CE' : 'CC', documento, nombre }
  return {
    contribuyente: { tipoPersona, tipoDocumento, documento, dv, nombre, direccion, telefono, correo, ...(impuesto === 'ica' && { establecimientos }) },
    declarante,
    contador,
  }
}

/**
 * Una sociedad que declara ReteICA sin estar inscrita en el RIT: lo que escribe en sus declaraciones. Su nombre no es
 * ninguno de los `usados`, para que no se confunda con un inscrito, y queda entre ellos.
 */
function noInscritoPor(az: Azar, municipioId: string, n: number, usados: Set<string>): Diligenciado {
  const documento = String(az.entero(900_100_000, 901_999_999))
  const dv = String(az.entero(0, 9))
  let nombre = nombreSujeto(az, 'juridica')
  while (usados.has(nombre)) nombre = nombreSujeto(az, 'juridica')
  usados.add(nombre)
  const representante = `${az.elegir(NOMBRES)} ${az.elegir(APELLIDOS)}`
  return {
    contribuyente: {
      tipoPersona: 'juridica',
      tipoDocumento: 'NIT',
      documento,
      dv,
      nombre,
      direccion: direccionAleatoria(az),
      telefono: telefonoAleatorio(az),
      correo: `tesoreria${n}@empresa.demo`,
    },
    declarante: { tipoDocumento: 'CC', documento: cedulaDe(`${municipioId}-sin-rit-${n}-${representante}`), nombre: representante },
    contador: datosContables(`${municipioId}-sin-rit-${n}`, 'juridica').contador,
  }
}

interface PerfilIca {
  ingresos: number
  fueraPct: number
  devolucionesPct: number
  excluidosPct: number
  avisos: boolean
  retencionesPct: number
  autorretencionesPct: number
}

/** Liquida el ICA anual. Con `emplazado`, la declaración llega después del emplazamiento para declarar (art. 642). */
function liquidarIca(p: PerfilIca, ins: Inscripcion, cfg: ConfigMunicipio, tarifas: Tarifa[], diasMora: number, descuentoPct: number, sancionCorreccion = 0, emplazado = false) {
  const tarifa = tarifas.find((t) => t.ciiu === ins.actividades[0].ciiu)?.porMil ?? 7
  const autorretenedor = ins.calidades.some((c) => c.calidad === 'autorretenedor')
  const r8 = redondearMil(p.ingresos)
  const r9 = redondearMil(r8 * p.fueraPct)
  const r10 = r8 - r9
  const r11 = redondearMil(r10 * p.devolucionesPct)
  const r14 = redondearMil(r10 * p.excluidosPct)
  const r16 = r10 - r11 - r14
  const r20 = redondearMil((r16 * tarifa) / 1000)
  const r21 = p.avisos ? redondearMil(r20 * 0.15) : 0
  const r23 = cfg.sobretasaBomberil.activa ? redondearMil((r20 * cfg.sobretasaBomberil.porcentaje) / 100) : 0
  const r25 = r20 + r21 + r23
  const r27 = autorretenedor ? 0 : redondearMil(r20 * p.retencionesPct)
  const r28 = autorretenedor ? redondearMil(r20 * p.autorretencionesPct) : 0
  const r29 = redondearMil((r20 * cfg.anticipoPorcentaje * 0.9) / 100)
  const r30 = redondearMil((r20 * cfg.anticipoPorcentaje) / 100)
  const r31 = sancionExtemporaneidad(r25, diasMora, cfg.sanciones, emplazado) + sancionCorreccion
  const saldo = r25 - r27 - r28 - r29 + r30 + r31
  const r33 = Math.max(saldo, 0)
  const r34 = Math.max(-saldo, 0)
  const r35 = r33
  const r36 = diasMora === 0 ? Math.min(redondearMil((r20 * descuentoPct) / 100), r35) : 0
  const r37 = diasMora > 0 ? redondearMil(r33 * 0.00067 * diasMora) : 0
  const r38 = r35 - r36 + r37
  const renglones: Renglon[] = [
    { codigo: '8', concepto: 'Total ingresos ordinarios y extraordinarios del país', valor: r8 },
    { codigo: '9', concepto: 'Menos ingresos fuera del municipio', valor: r9 },
    { codigo: '10', concepto: 'Ingresos en este municipio', valor: r10 },
    { codigo: '11', concepto: 'Menos devoluciones, rebajas y descuentos', valor: r11 },
    { codigo: '14', concepto: 'Menos actividades excluidas o no sujetas', valor: r14 },
    { codigo: '16', concepto: 'Total ingresos gravables', valor: r16 },
    { codigo: '17', concepto: `Total impuesto (tarifa ${tarifa} por mil)`, valor: r20 },
    { codigo: '20', concepto: 'Total impuesto de industria y comercio', valor: r20 },
    { codigo: '21', concepto: 'Avisos y tableros', valor: r21 },
    { codigo: '23', concepto: 'Sobretasa bomberil', valor: r23 },
    { codigo: '25', concepto: 'Total impuesto a cargo', valor: r25 },
    { codigo: '27', concepto: 'Menos retenciones', valor: r27 },
    { codigo: '28', concepto: 'Menos autorretenciones', valor: r28 },
    { codigo: '29', concepto: 'Menos anticipo liquidado el año anterior', valor: r29 },
    { codigo: '30', concepto: 'Anticipo para el año siguiente', valor: r30 },
    { codigo: '31', concepto: sancionCorreccion > 0 ? 'Sanciones (incluye sanción por corrección)' : 'Sanciones', valor: r31 },
    { codigo: '33', concepto: 'Total saldo a cargo', valor: r33 },
    { codigo: '34', concepto: 'Total saldo a favor', valor: r34 },
    { codigo: '35', concepto: 'Valor a pagar', valor: r35 },
    { codigo: '36', concepto: r36 > 0 ? `Descuento por pronto pago (${descuentoPct} %)` : 'Descuento por pronto pago', valor: r36 },
    { codigo: '37', concepto: 'Intereses de mora', valor: r37 },
    { codigo: '38', concepto: 'Total a pagar', valor: r38 },
  ]
  return { renglones, r33, r34, r38 }
}

/** Cuándo se presenta una retención o autorretención: a tiempo o, una de cada diez, con días de mora. */
function presentarRetencion(az: Azar, vencimiento: string) {
  const diasMora = az.prob(0.1) ? az.entero(3, 60) : 0
  const presentacion = diasMora > 0 ? sumarDias(vencimiento, diasMora) : sumarDias(vencimiento, -az.entero(0, 15))
  return { diasMora, presentacion }
}

/**
 * Renglones 13 a 18 de la ReteICA de un periodo: lo retenido en cada concepto y lo que no se retuvo por estar debajo
 * de la base mínima, menos las devoluciones. Lo pagado crece con los meses del periodo. `azBases` sortea solo los
 * pagos por debajo de la base mínima.
 */
function liquidarReteica(az: Azar, azBases: Azar, cfg: ConfigMunicipio, tarifas: Tarifa[], periodicidad: Periodicidad) {
  const renglones: Renglon[] = []
  const { baseMinimaServiciosUvt: minServicios, baseMinimaComprasUvt: minCompras } = cfg.reteica
  // Con tarifa única va un solo renglón para servicios y compras, con la menor de las dos bases mínimas.
  const conceptos =
    cfg.reteica.modalidad === 'unica'
      ? [{ tarifa: cfg.reteica.tarifaUnicaPorMil, de: 'servicios y compras', minimaUvt: Math.min(minServicios, minCompras) }]
      : [
          { tarifa: tarifas.find((t) => t.sector === 'servicios')!.porMil, de: 'servicios', minimaUvt: minServicios },
          { tarifa: tarifas.find((t) => t.sector === 'comercial')!.porMil, de: 'compras', minimaUvt: minCompras },
        ]
  let retenciones = 0
  for (const { tarifa, de, minimaUvt } of conceptos) {
    // La base es la suma de los pagos que llegan a la base mínima; los menores no se retienen. En un bimestre, de 15 a 900 millones.
    const base = az.entero(15, 900) * 500_000 * MESES_POR_PERIODO[periodicidad]
    const retencion = redondearMil((base * tarifa) / 1000)
    retenciones += retencion
    const minima = minimaUvt * UVT
    const menores = minima > 0 ? azBases.entero(0, 3) : 0
    const bajoMinima = Array.from({ length: menores }, () => redondearMil(minima * (0.2 + azBases.num() * 0.75))).reduce((a, b) => a + b, 0)
    renglones.push({
      codigo: '13–15',
      concepto:
        `Retención a ${tarifa} por mil sobre ${(base / 1_000_000).toLocaleString('es-CO')} millones en pagos de ${de}` +
        (menores > 0
          ? `. No se retienen ${menores} ${menores === 1 ? 'pago' : 'pagos'} por ${formatoPesos(bajoMinima)}, por debajo de la base mínima de ${formatoPesos(minima)} (${minimaUvt} UVT)`
          : ''),
      valor: retencion,
    })
  }
  const devoluciones = az.prob(0.15) ? redondearMil(retenciones * az.num() * 0.1) : 0
  const impuesto = retenciones - devoluciones
  renglones.push(
    { codigo: '16', concepto: 'Retenciones practicadas en el periodo', valor: retenciones },
    { codigo: '17', concepto: 'Devoluciones, anulaciones y retenciones en exceso', valor: devoluciones },
    { codigo: '18', concepto: 'Subtotal', valor: impuesto },
  )
  return { renglones, impuesto }
}

/**
 * Renglones 1 y 2 de la AutoReteICA de un periodo: la base, cerca de la parte de los ingresos del año que le toca al
 * periodo (un sexto en un bimestre), y lo autorretenido.
 */
function liquidarAutorretencion(az: Azar, cfg: ConfigMunicipio, tarifas: Tarifa[], ciiu: string, ingresos: number, periodicidad: Periodicidad) {
  const principal = tarifas.find((t) => t.ciiu === ciiu)?.porMil ?? 7
  const tarifa = cfg.autorretencion.modalidad === 'plena' ? principal : (principal * cfg.autorretencion.porcentaje) / 100
  const base = redondearMil((ingresos / (12 / MESES_POR_PERIODO[periodicidad])) * (0.8 + az.num() * 0.4))
  const impuesto = redondearMil((base * tarifa) / 1000)
  const renglones: Renglon[] = [
    { codigo: '1', concepto: `Base gravable del ${DURACION[periodicidad]}`, valor: base },
    { codigo: '2', concepto: `Autorretención a ${tarifa.toLocaleString('es-CO')} por mil`, valor: impuesto },
  ]
  return { renglones, impuesto }
}

// --- Correcciones a la baja ---

/** Lo que hace falta para volver a liquidar un ICA 2025 inicial: así se generan al final sus correcciones a la baja. */
interface ParaCorregir {
  ins: Inscripcion
  perfil: PerfilIca
  cfg: ConfigMunicipio
  tarifas: Tarifa[]
  descuento: number
  diasMora: number
  patron: 'total' | 'parcial' | 'ninguno'
}

/** Por qué corrige a la baja el contribuyente, el soporte que adjunta y qué cambia en su liquidación. */
const MOTIVOS_A_LA_BAJA: { motivo: string; soporte: string; ajustar: (p: PerfilIca, x: number) => PerfilIca }[] = [
  {
    motivo: 'Incluí en este municipio ingresos de actividades que realicé en otro municipio.',
    soporte: 'Declaración de ICA presentada en el otro municipio',
    ajustar: (p, x) => ({ ...p, fueraPct: p.fueraPct + x }),
  },
  {
    motivo: 'Declaré como gravados ingresos de actividades excluidas o no sujetas.',
    soporte: 'Certificación de los ingresos excluidos',
    ajustar: (p, x) => ({ ...p, excluidosPct: p.excluidosPct + x }),
  },
  {
    motivo: 'No resté las devoluciones, rebajas y descuentos del año.',
    soporte: 'Relación de notas crédito del año',
    ajustar: (p, x) => ({ ...p, devolucionesPct: p.devolucionesPct + x }),
  },
]

/**
 * Cada corrección a la baja de la demo. Las solicitudes (art. 589 anterior) van donde el municipio las usa: por resolver,
 * una de ellas con el plazo a punto de vencer, aceptada, aceptada por silencio y rechazada. Las directas, donde no: de una
 * declaración pagada, que deja un pago en exceso, y de una con pago parcial, que baja lo que falta por pagar.
 */
type CasoCorreccion = 'por_resolver' | 'por_resolver_pronto' | 'aceptada' | 'silencio' | 'rechazada' | 'directa_pagada' | 'directa_pago_parcial'

const CORRECCIONES_A_LA_BAJA: Record<string, CasoCorreccion[]> = {
  m1: ['por_resolver_pronto', 'por_resolver', 'aceptada', 'silencio'],
  m2: ['directa_pagada', 'directa_pago_parcial'],
  m3: ['por_resolver', 'rechazada'],
}

interface FuenteCorrecciones {
  az: Azar
  declaraciones: Declaracion[]
  pagos: Pago[]
  /** Las que la demo no corrige: las que tienen un cheque o se quitaron. */
  excluidas: Set<string>
  paraCorregir: Map<string, ParaCorregir>
  numero: () => string
  numeroFactura: () => number
  hoy: string
}

/**
 * Agrega las correcciones a la baja del ICA 2025, todas dentro del año siguiente al vencimiento y sin sanción por
 * corrección. Corrigen declaraciones presentadas a tiempo, sin corrección y sin cheque. Las solicitudes corrigen
 * declaraciones pagadas por completo, porque lo pagado se acredita fijo al generar los datos, como en las correcciones de
 * mayor valor, y no debe cambiar mientras se resuelven. Las por resolver y la aceptada por silencio se radican según la
 * fecha de hoy, como las de la aprobación previa; las resueltas, dentro del rango de la bitácora.
 */
function agregarCorreccionesABaja({ az, declaraciones, pagos, excluidas, paraCorregir, numero, numeroFactura, hoy }: FuenteCorrecciones) {
  const corregidas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
  const pagado = (id: string) => pagos.filter((p) => p.declaracionId === id).reduce((s, p) => s + p.valor, 0)
  const funcionario = (municipioId: string) => nombreCompleto(USUARIOS.find((u) => u.municipioId === municipioId && u.rol === 'funcionario')!)

  for (const [municipioId, casos] of Object.entries(CORRECCIONES_A_LA_BAJA)) {
    const conSolicitud = CONFIGURACIONES.find((c) => c.municipioId === municipioId)!.correccionABaja === 'proyecto_589'
    for (const caso of casos) {
      if (caso.startsWith('directa') === conSolicitud) continue
      const fecha =
        caso === 'por_resolver_pronto'
          ? sumarDias(sumarMeses(hoy, -6), az.entero(8, 12))
          : caso === 'por_resolver'
            ? sumarDias(hoy, -az.entero(20, 60))
            : caso === 'silencio'
              ? fechaAleatoria(az, '2026-04-20', '2026-04-28')
              : caso === 'aceptada'
                ? fechaAleatoria(az, '2026-06-01', '2026-06-30')
                : caso === 'rechazada'
                  ? fechaAleatoria(az, '2026-06-15', '2026-07-15')
                  : fechaAleatoria(az, '2026-07-01', '2026-10-15')
      const parcial = caso === 'directa_pago_parcial'
      const candidatas = declaraciones.filter((d) => {
        const x = paraCorregir.get(d.id)
        return (
          x !== undefined && d.municipioId === municipioId && x.diasMora === 0 && !corregidas.has(d.id) && !excluidas.has(d.id) &&
          valorLiquidado(d) > 0 && d.saldoAFavor === 0 && x.patron === (parcial ? 'parcial' : 'total') && (parcial || pagado(d.id) >= d.totalAPagar) &&
          d.fechaVencimiento < fecha && fecha <= limiteCorreccionABaja(d.fechaVencimiento)
        )
      })
      if (candidatas.length === 0) continue
      const original = az.elegir(candidatas)
      corregidas.add(original.id)
      const x = paraCorregir.get(original.id)!
      const m = az.elegir(MOTIVOS_A_LA_BAJA)
      const nueva = liquidarIca(m.ajustar(x.perfil, 0.08 + az.num() * 0.12), x.ins, x.cfg, x.tarifas, 0, x.descuento)
      const yaPagado = pagado(original.id)
      // Con el pago parcial, la corrección deja algo por pagar: baja la deuda sin que sobre.
      if (nueva.r38 >= valorLiquidado(original) || (parcial && nueva.r38 <= yaPagado)) continue
      const motivo = m.motivo
      const solicitudCorreccion: SolicitudCorreccion | undefined =
        caso === 'aceptada'
          ? { estado: 'aceptada', motivo, fecha: fechaAleatoria(az, '2026-09-01', '2026-09-30'), por: funcionario(municipioId), observacion: 'Se revisó el soporte que adjuntó: la corrección procede.' }
          : caso === 'rechazada'
            ? { estado: 'rechazada', motivo, fecha: fechaAleatoria(az, '2026-10-01', '2026-10-20'), por: funcionario(municipioId), observacion: 'No adjuntó soportes que demuestren el menor valor que pide' }
            : conSolicitud
              ? { estado: 'pendiente', motivo }
              : undefined
      declaraciones.push({
        // La rechazada no trae el soporte: por eso se rechaza.
        adjuntos: caso === 'rechazada' ? [] : [{ nombre: m.soporte, archivo: archivoAleatorio(az, m.soporte, fecha) }],
        ...diligenciadoPor(x.ins, fecha, 'ica'),
        id: `d${declaraciones.length + 1}`, municipioId, inscripcionId: x.ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'correccion',
        corrigeA: original.id, numero: numero(), numeroFactura: numeroFactura(), fechaPresentacion: fecha, fechaVencimiento: original.fechaVencimiento,
        renglones: yaPagado > 0 ? [...nueva.renglones, { codigo: CODIGO_PAGADO_CON_LA_CORREGIDA, concepto: 'Menos lo pagado con la declaración que se corrige', valor: yaPagado }] : nueva.renglones,
        totalAPagar: Math.max(nueva.r38 - yaPagado, 0), saldoAFavor: nueva.r34,
        ...(solicitudCorreccion && { solicitudCorreccion }),
      })
    }
  }
}

// --- Emplazamientos ---

interface FuenteEmplazamientos {
  az: Azar
  declaraciones: Declaracion[]
  inscripciones: Inscripcion[]
  pagos: Pago[]
  /** Las retenciones que se quitaron para que haya omisos. */
  omitidas: Set<string>
  /** Las que la demo no emplaza para corregir: las que tienen un cheque o se quitaron. */
  excluidas: Set<string>
  /** Los ICA 2025 omisos, con lo que hace falta para liquidar su declaración si responden. */
  omisosIca: { ins: Inscripcion; perfil: PerfilIca; cfg: ConfigMunicipio; tarifas: Tarifa[] }[]
  paraCorregir: Map<string, ParaCorregir>
  numero: () => string
  numeroFactura: () => number
  agregarPago: (declaracionId: string, fecha: string, valor: number, azar: Azar) => void
  hoy: string
}

/**
 * Los emplazamientos de la demo, en cada estado:
 * - San José del Valle emplaza en un lote del 18 de agosto de 2026 a sus dos omisos del ICA 2025: uno declara dentro del
 *   mes, con la extemporaneidad del art. 642, y el otro deja vencer el plazo. Además emplaza para corregir un ICA 2025
 *   pagado, que se corrige con la sanción de corrección tras emplazamiento.
 * - Puerto Esperanza emplaza a dos agentes de ReteICA omisos hace unos días hábiles (siguen en plazo) y para corregir a
 *   un contribuyente que no responde.
 * - Santa Rosa, sin RIT ni omisos, emplaza para corregir hace unos días.
 * Los de fecha fija caen en el rango de la bitácora; los demás se cuentan desde hoy, como la aprobación previa.
 */
function agregarEmplazamientos(f: FuenteEmplazamientos): Emplazamiento[] {
  const { az, declaraciones, pagos, excluidas, paraCorregir, hoy } = f
  const emplazamientos: Emplazamiento[] = []
  const quien = (id: string) => nombreCompleto(USUARIOS.find((u) => u.id === id)!)
  const emplazar = (destino: DestinoEmplazamiento, numero: string, fechaNotificacion: string, registradoPor: string, fechaRegistro: string, conCopia = false) => {
    const copia = conCopia ? archivoAleatorio(az, `Emplazamiento ${numero}`, fechaRegistro) : undefined
    emplazamientos.push({ ...destino, id: `em${emplazamientos.length + 1}`, numero, fechaNotificacion, registradoPor, fechaRegistro, ...(copia && { copia }) })
  }
  const paraDeclarar = (o: Omiso): DestinoEmplazamiento => ({
    tipo: 'declarar',
    municipioId: o.inscripcion.municipioId,
    inscripcionId: o.inscripcion.id,
    impuesto: o.impuesto,
    vigencia: o.vigencia,
    periodicidad: o.periodicidad,
    periodo: o.periodo,
  })
  const pagado = (id: string) => pagos.filter((p) => p.declaracionId === id).reduce((s, p) => s + p.valor, 0)
  const corregidas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
  // Para corregir: un ICA 2025 a tiempo, pagado por completo, sin corrección ni cheque, presentado antes de la notificación.
  const aEmplazar = (municipioId: string, notificacion: string) => {
    const candidatas = declaraciones.filter((d) => {
      const x = paraCorregir.get(d.id)
      return (
        x !== undefined && d.municipioId === municipioId && x.diasMora === 0 && x.patron === 'total' && !corregidas.has(d.id) && !excluidas.has(d.id) &&
        valorLiquidado(d) > 0 && d.saldoAFavor === 0 && pagado(d.id) >= d.totalAPagar && d.fechaPresentacion < notificacion
      )
    })
    if (candidatas.length === 0) return undefined
    const elegida = az.elegir(candidatas)
    corregidas.add(elegida.id)
    return elegida
  }

  const { omisos } = calcularOmisos(
    { municipios: MUNICIPIOS, configuraciones: CONFIGURACIONES, inscripciones: f.inscripciones, declaraciones: declaraciones.filter((d) => !f.omitidas.has(d.id)) },
    null,
    hoy,
  )

  // San José del Valle: el lote de los omisos del ICA 2025. Declara el que tiene con qué liquidar su ICA.
  const LOTE = '2026-08-18'
  const icaM1 = omisos.filter((o) => o.inscripcion.municipioId === 'm1' && o.impuesto === 'ica' && o.vigencia === 2025 && o.vencimiento < LOTE)
  const declara = icaM1.find((o) => f.omisosIca.some((x) => x.ins.id === o.inscripcion.id))
  const deja = icaM1.find((o) => o !== declara)
  if (declara) emplazar(paraDeclarar(declara), 'EPD-2026-014', LOTE, quien('u3'), '2026-08-19', true)
  if (deja) emplazar(paraDeclarar(deja), 'EPD-2026-015', LOTE, quien('u3'), '2026-08-19')
  if (declara) {
    const x = f.omisosIca.find((y) => y.ins.id === declara.inscripcion.id)!
    const presentacion = '2026-09-08'
    const liq = liquidarIca(x.perfil, x.ins, x.cfg, x.tarifas, diferenciaDias(declara.vencimiento, presentacion), 0, 0, true)
    const id = `d${declaraciones.length + 1}`
    declaraciones.push({
      adjuntos: [],
      ...diligenciadoPor(x.ins, presentacion, 'ica'),
      id, municipioId: 'm1', inscripcionId: x.ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'inicial',
      numero: f.numero(), numeroFactura: f.numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: declara.vencimiento, renglones: liq.renglones,
      totalAPagar: liq.r38, saldoAFavor: liq.r34,
    })
    f.agregarPago(id, presentacion, liq.r38, az)
  }

  // San José del Valle: para corregir, y la corrección con la sanción de corrección tras emplazamiento.
  const original = aEmplazar('m1', '2026-09-01')
  if (original) {
    emplazar({ tipo: 'corregir', municipioId: 'm1', declaracionId: original.id }, 'EPC-2026-007', '2026-09-01', quien('u3'), '2026-09-02', true)
    const x = paraCorregir.get(original.id)!
    const corregido = { ...x.perfil, ingresos: x.perfil.ingresos * (1.06 + az.num() * 0.08) }
    const base = liquidarIca(corregido, x.ins, x.cfg, x.tarifas, 0, 0)
    const r33 = original.renglones.find((r) => r.codigo === '33')?.valor ?? 0
    const mayorValor = Math.max(base.r33 - r33, 0)
    const sancion = Math.max(redondearMil((mayorValor * x.cfg.sanciones.correccionEmplazamiento) / 100), redondearMil(x.cfg.sanciones.minimaUvt * UVT))
    const nueva = liquidarIca(corregido, x.ins, x.cfg, x.tarifas, 0, 0, sancion)
    const yaPagado = pagado(original.id)
    const fecha = '2026-09-22'
    const id = `d${declaraciones.length + 1}`
    declaraciones.push({
      adjuntos: [],
      ...diligenciadoPor(x.ins, fecha, 'ica'),
      id, municipioId: 'm1', inscripcionId: x.ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'correccion',
      corrigeA: original.id, numero: f.numero(), numeroFactura: f.numeroFactura(), fechaPresentacion: fecha, fechaVencimiento: original.fechaVencimiento,
      renglones: [...nueva.renglones, { codigo: CODIGO_PAGADO_CON_LA_CORREGIDA, concepto: 'Menos lo pagado con la declaración que se corrige', valor: yaPagado }],
      totalAPagar: Math.max(nueva.r38 - yaPagado, 0), saldoAFavor: nueva.r34,
    })
    f.agregarPago(id, fecha, Math.max(nueva.r38 - yaPagado, 0), az)
  }

  // Puerto Esperanza: para corregir sin respuesta, y dos agentes de ReteICA omisos, distintos, emplazados hace unos días.
  const sinRespuesta = aEmplazar('m2', '2026-09-10')
  if (sinRespuesta) emplazar({ tipo: 'corregir', municipioId: 'm2', declaracionId: sinRespuesta.id }, 'EPC-2026-031', '2026-09-10', quien('u6'), '2026-09-11')
  const reciente = sumarDiasHabiles(hoy, -3)
  const agentes = omisos
    .filter((o) => o.inscripcion.municipioId === 'm2' && o.impuesto === 'reteica' && o.inscripcion.estado === 'activa' && o.vencimiento < reciente)
    .filter((o, i, lista) => lista.findIndex((y) => y.inscripcion.id === o.inscripcion.id) === i)
    .slice(0, 2)
  agentes.forEach((o, i) => emplazar(paraDeclarar(o), `EPD-2026-${102 + i}`, reciente, quien('u6'), reciente, i === 0))

  // Santa Rosa: para corregir, en plazo.
  const enPlazo = aEmplazar('m3', sumarDiasHabiles(hoy, -4))
  if (enPlazo) emplazar({ tipo: 'corregir', municipioId: 'm3', declaracionId: enPlazo.id }, 'EPC-2026-005', sumarDiasHabiles(hoy, -4), quien('u8'), sumarDiasHabiles(hoy, -4), true)

  return emplazamientos
}

/**
 * Agrega a los renglones de una retención o autorretención la sanción, los intereses y el total, que devuelve. Con
 * `emplazado`, la declaración llega después del emplazamiento para declarar (art. 642).
 */
function cerrarRetencion(renglones: Renglon[], impuesto: number, diasMora: number, cfg: ConfigMunicipio, emplazado = false) {
  const sancion = sancionExtemporaneidad(impuesto, diasMora, cfg.sanciones, emplazado)
  const intereses = diasMora > 0 ? redondearMil(impuesto * 0.00067 * diasMora) : 0
  const total = impuesto + sancion + intereses
  renglones.push(
    { codigo: 'S', concepto: 'Sanción por extemporaneidad', valor: sancion },
    { codigo: 'I', concepto: 'Intereses de mora', valor: intereses },
    { codigo: 'T', concepto: 'Total a pagar', valor: total },
  )
  return total
}

export function generarDatos(): Datos {
  const az = crearAzar(20261022)
  // Los pagos por debajo de la base mínima de ReteICA tienen su propio azar para no cambiar el resto de los datos.
  const azBases = crearAzar(1529)
  const inscripciones: Inscripcion[] = []
  const declaraciones: Declaracion[] = []
  const pagos: Pago[] = []
  /** Contribuyentes que no declararon el ICA 2025 en plazo. */
  const omisos: { municipio: Municipio; ins: Inscripcion; perfil: PerfilIca; cfg: ConfigMunicipio; tarifas: Tarifa[] }[] = []
  /** Los ICA 2025 iniciales, para volver a liquidarlos en sus correcciones a la baja. Guardarlos no usa el azar. */
  const paraCorregir = new Map<string, ParaCorregir>()
  let consecutivo = 1

  // Con `registrar` en falso sortea el medio igual, pero no deja el pago: así no cambia el resto de los datos.
  const agregarPago = (declaracionId: string, fecha: string, valor: number, azar = az, registrar = true) => {
    if (valor <= 0) return
    const medio = azar.elegir(['PSE', 'Banco de Bogotá', 'Bancolombia', 'Davivienda'])
    if (registrar) pagos.push({ id: `p${pagos.length + 1}`, declaracionId, fecha, valor, medio })
  }
  // Si a la fecha de la demo aún no vence el plazo de 2 meses para consignar, algunas retenciones que se pagarían siguen
  // sin pagar, para que la demo siempre tenga retenciones en plazo. Lo decide su propio azar.
  const azPlazo = crearAzar(5801)
  const yaPagada = (vencimiento: string) => limiteConsignacion(vencimiento) <= FECHA_DEMO || azPlazo.prob(0.7)
  const numero = (prefijo: string, vigencia: number) => `${prefijo}-${vigencia}-${String(consecutivo++).padStart(6, '0')}`
  // La factura lleva su propio consecutivo y no usa el azar, para no cambiar el resto de los datos.
  let factura = 4_810_200_000
  const numeroFactura = () => ++factura

  for (const municipio of MUNICIPIOS) {
    const cfg = CONFIGURACIONES.find((c) => c.municipioId === municipio.id)!
    const tarifasDe = (vigencia: number) => ACTIVIDADES_POR_VIGENCIA.find((a) => a.municipioId === municipio.id && a.vigencia === vigencia)!.tarifas
    const tarifas2025 = tarifasDe(2025)
    const tarifas2026 = tarifasDe(2026)
    for (let n = 1; n <= INSCRIPCIONES_POR_MUNICIPIO; n++) {
      const ins = generarInscripcion(az, municipio.id, n)
      inscripciones.push(ins)
      const esNatural = ins.tipoPersona === 'natural'
      const perfil: PerfilIca = {
        ingresos: (esNatural ? az.entero(60, 900) : az.entero(400, 18_000)) * 1_000_000,
        fueraPct: az.prob(0.3) ? az.num() * 0.3 : 0,
        devolucionesPct: az.num() * 0.03,
        excluidosPct: az.prob(0.2) ? az.num() * 0.1 : 0,
        avisos: az.prob(0.6),
        retencionesPct: az.num() * 0.2,
        // Hasta 120% del impuesto: algunos autorretenedores terminan con saldo a favor.
        autorretencionesPct: 0.75 + az.num() * 0.45,
      }
      const puedeDeclararIca = ins.calidades.some((c) => c.calidad === 'contribuyente') && !ins.regimenSimple

      // ICA anual, año gravable 2025.
      if (ins.estado === 'activa' && puedeDeclararIca && az.prob(0.9)) {
        const vencimiento = vencimientoIca(cfg, 2025, ins.documento)
        const diasMora = az.prob(0.12) ? az.entero(5, 120) : 0
        const presentacion = diasMora > 0 ? sumarDias(vencimiento, diasMora) : sumarDias(vencimiento, -az.entero(1, 60))
        const patron = az.prob(0.8) ? 'total' : az.prob(0.6) ? 'parcial' : 'ninguno'
        // Solo conserva el descuento quien paga todo y está a paz y salvo; el porcentaje sale del tramo de la fecha de pago.
        const descuento = patron === 'total' && az.prob(0.6) ? porcentajeProntoPago(cfg, 2025, presentacion) : 0
        const liq = liquidarIca(perfil, ins, cfg, tarifas2025, diasMora, descuento)
        sorteoDeRevision(az, 0.3)
        const id = `d${declaraciones.length + 1}`
        declaraciones.push({
          adjuntos: [],
          ...diligenciadoPor(ins, presentacion, 'ica'),
          id, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'inicial',
          numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: vencimiento, renglones: liq.renglones,
          totalAPagar: liq.r38, saldoAFavor: liq.r34,
        })
        paraCorregir.set(id, { ins, perfil, cfg, tarifas: tarifas2025, descuento, diasMora, patron })
        if (patron === 'total') agregarPago(id, presentacion, liq.r38)
        if (patron === 'parcial') agregarPago(id, presentacion, redondearMil(liq.r38 * (0.4 + az.num() * 0.3)))

        // Corrección de mayor valor: hereda como crédito lo ya pagado.
        if (patron === 'total' && liq.r38 > 0 && az.prob(0.1)) {
          const corregido = { ...perfil, ingresos: perfil.ingresos * (1.05 + az.num() * 0.1) }
          const base = liquidarIca(corregido, ins, cfg, tarifas2025, diasMora, 0)
          const mayorValor = Math.max(base.r33 - liq.r33, 0)
          const sancion = Math.max(redondearMil((mayorValor * cfg.sanciones.correccion) / 100), redondearMil(cfg.sanciones.minimaUvt * UVT))
          const nueva = liquidarIca(corregido, ins, cfg, tarifas2025, diasMora, 0, sancion)
          const pagado = liq.r38
          const aPagar = Math.max(nueva.r38 - pagado, 0)
          const fecha = menor(sumarDias(presentacion, az.entero(30, 150)), FECHA_DEMO)
          const idCorreccion = `d${declaraciones.length + 1}`
          declaraciones.push({
            adjuntos: [],
            ...diligenciadoPor(ins, fecha, 'ica'),
            id: idCorreccion, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'correccion',
            corrigeA: id, numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: fecha, fechaVencimiento: vencimiento,
            renglones: [...nueva.renglones, { codigo: CODIGO_PAGADO_CON_LA_CORREGIDA, concepto: 'Menos lo pagado con la declaración que se corrige', valor: pagado }],
            totalAPagar: aPagar, saldoAFavor: nueva.r34,
          })
          agregarPago(idCorreccion, fecha, aPagar)
        }
      } else if (ins.estado === 'activa' && puedeDeclararIca) {
        omisos.push({ municipio, ins, perfil, cfg, tarifas: tarifas2025 })
      }

      // Clausura: quien canceló su RIT presenta la fracción de año.
      if (ins.estado === 'cancelada' && puedeDeclararIca) {
        const cierre = ins.novedades.find((nv) => nv.tipo === 'cancelacion')!.fecha
        const fraccion = { ...perfil, ingresos: perfil.ingresos * (0.3 + az.num() * 0.4) }
        const liq = liquidarIca(fraccion, ins, { ...cfg, anticipoPorcentaje: 0 }, tarifas2026, 0, 0)
        const presentacion = sumarDias(cierre, az.entero(5, 25))
        const id = `d${declaraciones.length + 1}`
        declaraciones.push({
          adjuntos: [],
          ...diligenciadoPor(ins, presentacion, 'ica'),
          id, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2026, periodicidad: 'anual', periodo: 1, tipo: 'clausura',
          fechaCierre: cierre, numero: numero('ICA', 2026), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: sumarDias(cierre, 60),
          renglones: liq.renglones, totalAPagar: liq.r38, saldoAFavor: liq.r34,
        })
        agregarPago(id, presentacion, liq.r38)
      }

      if (ins.estado !== 'activa') continue

      // Retención (ReteICA) y autorretención de 2026: los periodos del calendario de cada formulario que ya vencieron a la
      // fecha de la demo. Los dos formularios se recorren a la par, periodo a periodo.
      const formularios = (['reteica', 'autorretencion'] as const)
        .filter((impuesto) => ins.calidades.some((c) => c.calidad === CALIDAD_RETENCION[impuesto]))
        .map((impuesto) => ({ impuesto, periodos: periodosVencidos(cfg, impuesto, 2026, ins.documento) }))
      for (let i = 0; i < Math.max(0, ...formularios.map((f) => f.periodos.length)); i++) {
        for (const { impuesto, periodos } of formularios) {
          const p = periodos[i]
          if (!p) continue
          const { diasMora, presentacion } = presentarRetencion(az, p.vencimiento)
          // Si la presentaría después de la fecha de la demo, todavía no la ha presentado.
          if (presentacion > FECHA_DEMO) continue
          const esRete = impuesto === 'reteica'
          const liquidacion = esRete
            ? liquidarReteica(az, azBases, cfg, tarifas2026, p.periodicidad)
            : liquidarAutorretencion(az, cfg, tarifas2026, ins.actividades[0].ciiu, perfil.ingresos, p.periodicidad)
          const total = cerrarRetencion(liquidacion.renglones, liquidacion.impuesto, diasMora, cfg)
          // El último periodo vencido sortea distinto, como el bimestre 4 cuando la demo solo tenía bimestres.
          sorteoDeRevision(az, i === periodos.length - 1 ? 0.7 : 0.1)
          const id = `d${declaraciones.length + 1}`
          declaraciones.push({
            adjuntos: [],
            ...diligenciadoPor(ins, presentacion, impuesto),
            id, municipioId: municipio.id, inscripcionId: ins.id, impuesto, vigencia: 2026, periodicidad: p.periodicidad, periodo: p.periodo,
            tipo: 'inicial', numero: numero(esRete ? 'RET' : 'AUT', 2026), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: p.vencimiento,
            renglones: liquidacion.renglones, totalAPagar: total, saldoAFavor: 0,
          })
          if (az.prob(esRete ? 0.9 : 0.95)) agregarPago(id, presentacion, total, az, yaPagada(p.vencimiento))
        }
      }
    }
  }

  // Algunos municipios piden anexos con la declaración; no todos los contribuyentes los cargan.
  for (const d of declaraciones) {
    d.adjuntos = ANEXOS[d.impuesto].filter(() => az.prob(d.impuesto === 'ica' ? 0.45 : 0.6)).map((nombre) => ({ nombre, archivo: archivoAleatorio(az, nombre, d.fechaPresentacion) }))
  }

  // Aprobación previa: los omisos del ICA 2025 se ponen al día en los últimos días hábiles antes de
  // generar los datos, para que la demo siempre tenga declaraciones por aprobar en plazo y vencidas.
  // Tienen su propio azar para no cambiar el resto de los datos, y aún no tienen pagos.
  const azAprobacion = crearAzar(4056)
  const hoy = new Date().toISOString().slice(0, 10)
  for (const { municipio, ins, perfil, cfg, tarifas } of omisos) {
    if (!municipio.aprobacionPrevia.ica) continue
    const vencimiento = vencimientoIca(cfg, 2025, ins.documento)
    const presentacion = sumarDiasHabiles(hoy, -azAprobacion.entero(0, 9))
    const diasMora = Math.max(Math.round((Date.parse(presentacion) - Date.parse(vencimiento)) / 86400000), 0)
    const liq = liquidarIca(perfil, ins, cfg, tarifas, diasMora, 0)
    declaraciones.push({
      adjuntos: ANEXOS.ica.filter(() => azAprobacion.prob(0.45)).map((nombre) => ({ nombre, archivo: archivoAleatorio(azAprobacion, nombre, presentacion) })),
      ...diligenciadoPor(ins, presentacion, 'ica'),
      id: `d${declaraciones.length + 1}`, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodicidad: 'anual', periodo: 1, tipo: 'inicial',
      numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: vencimiento, renglones: liq.renglones,
      totalAPagar: liq.r38, saldoAFavor: liq.r34, aprobacion: { estado: 'pendiente' },
    })
  }

  // Agentes de ReteICA que no están inscritos en el RIT: declaran donde el municipio tiene el RIT, pero no valida la
  // ReteICA contra el RIT. Tienen su propio azar para no cambiar el resto de los datos.
  const azNoInscritos = crearAzar(402)
  const nombresUsados = new Set(inscripciones.map((i) => i.nombre))
  for (const municipio of MUNICIPIOS.filter((m) => m.rit && m.impuestos.reteica && !m.validarContraRit.reteica)) {
    const cfg = CONFIGURACIONES.find((c) => c.municipioId === municipio.id)!
    const tarifas = ACTIVIDADES_POR_VIGENCIA.find((a) => a.municipioId === municipio.id && a.vigencia === 2026)!.tarifas
    for (let n = 1; n <= AGENTES_NO_INSCRITOS; n++) {
      const diligenciado = noInscritoPor(azNoInscritos, municipio.id, n, nombresUsados)
      for (const p of periodosVencidos(cfg, 'reteica', 2026, diligenciado.contribuyente.documento)) {
        const { diasMora, presentacion } = presentarRetencion(azNoInscritos, p.vencimiento)
        if (presentacion > FECHA_DEMO) continue
        const { renglones, impuesto } = liquidarReteica(azNoInscritos, azNoInscritos, cfg, tarifas, p.periodicidad)
        const total = cerrarRetencion(renglones, impuesto, diasMora, cfg)
        const id = `d${declaraciones.length + 1}`
        declaraciones.push({
          adjuntos: ANEXOS.reteica.filter(() => azNoInscritos.prob(0.6)).map((nombre) => ({ nombre, archivo: archivoAleatorio(azNoInscritos, nombre, presentacion) })),
          ...structuredClone(diligenciado),
          id, municipioId: municipio.id, impuesto: 'reteica', vigencia: 2026, periodicidad: p.periodicidad, periodo: p.periodo, tipo: 'inicial',
          numero: numero('RET', 2026), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: p.vencimiento,
          renglones, totalAPagar: total, saldoAFavor: 0,
        })
        if (azNoInscritos.prob(0.9)) agregarPago(id, presentacion, total, azNoInscritos, yaPagada(p.vencimiento))
      }
    }
  }

  const cheques = generarCheques(declaraciones, pagos)
  const recaudoHistorico = generarHistorico(az, declaraciones, pagos)

  // Omisos de retención: algunos agentes y autorretenedores no declararon un periodo, salvo el primero. Se quitan al final
  // y con su propio azar para no cambiar el resto de los datos; no se tocan las declaraciones que tienen un cheque.
  const azOmisos = crearAzar(580)
  const conCheque = new Set(cheques.map((c) => c.declaracionId))
  const omitidas = new Set(
    declaraciones.filter((d) => d.impuesto !== 'ica' && d.periodo >= 2 && !conCheque.has(d.id) && azOmisos.prob(0.12)).map((d) => d.id),
  )

  // Correcciones a la baja del ICA 2025: al final y con su propio azar, para no cambiar el resto de los datos.
  agregarCorreccionesABaja({
    az: crearAzar(589),
    declaraciones,
    pagos,
    excluidas: new Set([...conCheque, ...omitidas]),
    paraCorregir,
    numero: () => numero('ICA', 2025),
    numeroFactura,
    hoy,
  })

  // Emplazamientos: al final y con su propio azar, para no cambiar el resto de los datos.
  const emplazamientos = agregarEmplazamientos({
    az: crearAzar(715),
    declaraciones,
    inscripciones,
    pagos,
    omitidas,
    excluidas: new Set([...conCheque, ...omitidas]),
    omisosIca: omisos,
    paraCorregir,
    numero: () => numero('ICA', 2025),
    numeroFactura,
    agregarPago,
    hoy,
  })

  // Donde el municipio no tiene el RIT en el aplicativo no hay inscripciones: de sus contribuyentes solo se sabe lo que
  // escriben en las declaraciones. Se generan igual y aquí se quitan, para no cambiar el resto de los datos.
  const conRit = new Set(MUNICIPIOS.filter((m) => m.rit).map((m) => m.id))
  for (const d of declaraciones) if (!conRit.has(d.municipioId)) delete d.inscripcionId

  const datos = {
    municipios: MUNICIPIOS.map((m) => ({ ...m })),
    usuarios: USUARIOS.map((u) => ({ ...u })),
    inscripciones: inscripciones.filter((i) => conRit.has(i.municipioId)),
    declaraciones: declaraciones.filter((d) => !omitidas.has(d.id)),
    pagos: pagos.filter((p) => !omitidas.has(p.declaracionId)),
    cheques,
    recaudoHistorico,
    configuraciones: structuredClone(CONFIGURACIONES),
    actividades: structuredClone(ACTIVIDADES_POR_VIGENCIA),
    emplazamientos,
  }
  return { ...datos, bitacora: generarBitacora(datos) }
}

/** Un cheque de gerencia en canje en cada municipio que los recibe en algún formulario. No usa el azar, para no cambiar el resto de los datos. */
function generarCheques(declaraciones: Declaracion[], pagos: Pago[]): Cheque[] {
  const reemplazadas = new Set(declaraciones.map((d) => d.corrigeA).filter(Boolean))
  const conPago = new Set(pagos.map((p) => p.declaracionId))
  return MUNICIPIOS.flatMap((m, i) => {
    const d = declaraciones.find(
      (x) => x.municipioId === m.id && m.impuestos[x.impuesto] && m.pagoCheque[x.impuesto] && x.totalAPagar > 0 && !x.aprobacion && !reemplazadas.has(x.id) && !conPago.has(x.id),
    )
    const funcionario = USUARIOS.find((u) => u.municipioId === m.id && u.rol === 'funcionario')
    if (!d || !funcionario) return []
    return [{
      id: `ch${i + 1}`, declaracionId: d.id, valor: d.totalAPagar, banco: 'Bancolombia', numero: `00${4827 + i}`, recibo: `RC-00${4498 + i}`,
      fechaRecibo: '2026-10-20', recibidoPor: nombreCompleto(funcionario), estado: 'en_canje' as const,
    }]
  })
}

/**
 * Recaudo de los tres años anteriores, por mes. Toma la forma del año de lo recaudado
 * en 2026 y la escala hacia atrás con un crecimiento de cerca del 6 % anual.
 */
function generarHistorico(az: Azar, declaraciones: Declaracion[], pagos: Pago[]): RecaudoMensual[] {
  const porId = new Map(declaraciones.map((d) => [d.id, d]))
  const historico: RecaudoMensual[] = []

  for (const m of MUNICIPIOS) {
    const cfg = CONFIGURACIONES.find((c) => c.municipioId === m.id)!
    const base = Array.from({ length: 12 }, () => ({ ica: 0, reteica: 0, autorretencion: 0 }))
    for (const p of pagos) {
      const d = porId.get(p.declaracionId)
      if (d?.municipioId !== m.id || !p.fecha.startsWith('2026')) continue
      base[Number(p.fecha.slice(5, 7)) - 1][d.impuesto] += p.valor
    }

    // Retención y autorretención se pagan todos los periodos, con la periodicidad del calendario de 2026: se toma el
    // promedio de los periodos de 2026 que ya tienen recaudo y se reparte entre sus meses como se repartió en 2026.
    const porPeriodo = (impuesto: Impuesto) => {
      const meses = MESES_POR_PERIODO[formularioDe(cfg, impuesto, 2026).periodicidad]
      const periodos = Array.from({ length: 12 / meses }, (_, k) => base.slice(k * meses, (k + 1) * meses).reduce((s, b) => s + b[impuesto], 0)).filter((v) => v > 0)
      const total = periodos.reduce((s, v) => s + v, 0)
      // La parte de cada mes del periodo; la del último es lo que les falta a los demás.
      const reparto = Array.from({ length: meses - 1 }, (_, j) => (total === 0 ? 1 / meses : base.filter((_, i) => i % meses === j).reduce((s, b) => s + b[impuesto], 0) / total))
      reparto.push(1 - reparto.reduce((s, v) => s + v, 0))
      return { promedio: periodos.length === 0 ? 0 : total / periodos.length, reparto }
    }
    const reteica = porPeriodo('reteica')
    const autorretencion = porPeriodo('autorretencion')
    const enMes = (b: { promedio: number; reparto: number[] }, i: number) => b.promedio * b.reparto[i % b.reparto.length]

    for (const anio of [2025, 2024, 2023]) {
      const factor = 0.94 ** (2026 - anio)
      base.forEach((b, i) =>
        historico.push({
          municipioId: m.id,
          anio,
          mes: i + 1,
          valores: {
            ica: redondearMil(b.ica * factor * (0.9 + az.num() * 0.2)),
            reteica: redondearMil(enMes(reteica, i) * factor * (0.85 + az.num() * 0.3)),
            autorretencion: redondearMil(enMes(autorretencion, i) * factor * (0.85 + az.num() * 0.3)),
          },
        }),
      )
    }
  }
  return historico
}
