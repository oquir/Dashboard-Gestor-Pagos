// Genera los datos de la demo con una semilla fija: siempre salen los mismos.
import { etiquetaCalidad, nombreCompleto } from '../lib/formato'
import { porcentajeProntoPago, redondearMil, sumarDiasHabiles, UVT } from '../lib/reglas'
import type {
  Archivo,
  Calidad,
  CalidadInscrita,
  ConfigMunicipio,
  Datos,
  DatosRit,
  Declaracion,
  EstadoInscripcion,
  EstadoRevision,
  Impuesto,
  Inscripcion,
  Municipio,
  Novedad,
  Pago,
  RecaudoMensual,
  Renglon,
  Tarifa,
  TipoPersona,
} from '../types'
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
  VENCIMIENTO_ICA_2025,
  VENCIMIENTOS_BIMESTRE_2026,
} from './catalogos'

const INSCRIPCIONES_POR_MUNICIPIO = 40
const FECHA_DEMO = '2026-10-21'

function crearAzar(semilla: number) {
  let s = semilla >>> 0
  const num = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    num,
    entero: (min: number, max: number) => min + Math.floor(num() * (max - min + 1)),
    elegir: <T>(lista: T[]) => lista[Math.floor(num() * lista.length)],
    prob: (p: number) => num() < p,
  }
}
type Azar = ReturnType<typeof crearAzar>

function sumarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

const menor = (a: string, b: string) => (a < b ? a : b)
const fechaAleatoria = (az: Azar, desde: string, hasta: string) =>
  sumarDias(desde, az.entero(0, Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000)))

const OBSERVACIONES = [
  'Las retenciones del renglón 27 no coinciden con la información exógena de los agentes.',
  'Revisar la tarifa aplicada a la actividad principal.',
  'El renglón 28 no cuadra con las autorretenciones declaradas en el año.',
  'Los ingresos fuera del municipio no tienen soporte de territorialidad.',
]

function estadoRevisionAleatorio(az: Azar, probPendiente: number): { estado: EstadoRevision; observacion?: string } {
  if (az.prob(probPendiente)) return { estado: 'pendiente' }
  if (az.prob(0.15)) return { estado: 'con_observaciones', observacion: az.elegir(OBSERVACIONES) }
  return { estado: 'revisada' }
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
  const fechaInscripcion = sumarDias(fechaInicio, az.entero(5, 50))
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

interface PerfilIca {
  ingresos: number
  fueraPct: number
  devolucionesPct: number
  excluidosPct: number
  avisos: boolean
  retencionesPct: number
  autorretencionesPct: number
}

function liquidarIca(p: PerfilIca, ins: Inscripcion, cfg: ConfigMunicipio, tarifas: Tarifa[], diasMora: number, descuentoPct: number, sancionCorreccion = 0) {
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
  const meses = Math.ceil(diasMora / 30)
  const minima = cfg.sanciones.minimaUvt * UVT
  const extemporaneidad = diasMora > 0 ? Math.max(redondearMil((r25 * Math.min(meses * cfg.sanciones.extemporaneidad, 100)) / 100), redondearMil(minima)) : 0
  const r31 = extemporaneidad + sancionCorreccion
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

export function generarDatos(): Datos {
  const az = crearAzar(20261022)
  const inscripciones: Inscripcion[] = []
  const declaraciones: Declaracion[] = []
  const pagos: Pago[] = []
  /** Contribuyentes que no declararon el ICA 2025 en plazo. */
  const omisos: { municipio: Municipio; ins: Inscripcion; perfil: PerfilIca; cfg: ConfigMunicipio; tarifas: Tarifa[] }[] = []
  let consecutivo = 1

  const agregarPago = (declaracionId: string, fecha: string, valor: number) => {
    if (valor > 0) pagos.push({ id: `p${pagos.length + 1}`, declaracionId, fecha, valor, medio: az.elegir(['PSE', 'Banco de Bogotá', 'Bancolombia', 'Davivienda']) })
  }
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
        const vencimiento = VENCIMIENTO_ICA_2025[municipio.id]
        const diasMora = az.prob(0.12) ? az.entero(5, 120) : 0
        const presentacion = diasMora > 0 ? sumarDias(vencimiento, diasMora) : sumarDias(vencimiento, -az.entero(1, 60))
        const patron = az.prob(0.8) ? 'total' : az.prob(0.6) ? 'parcial' : 'ninguno'
        // Solo conserva el descuento quien paga todo y está a paz y salvo; el porcentaje sale del tramo de la fecha de pago.
        const descuento = patron === 'total' && az.prob(0.6) ? porcentajeProntoPago(cfg, 2025, presentacion) : 0
        const liq = liquidarIca(perfil, ins, cfg, tarifas2025, diasMora, descuento)
        const revision = estadoRevisionAleatorio(az, 0.3)
        const id = `d${declaraciones.length + 1}`
        declaraciones.push({
          adjuntos: [],
          id, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodo: 1, tipo: 'inicial',
          numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: vencimiento, renglones: liq.renglones,
          totalAPagar: liq.r38, saldoAFavor: liq.r34, estadoRevision: revision.estado, observacion: revision.observacion,
        })
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
            id: idCorreccion, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodo: 1, tipo: 'correccion',
            corrigeA: id, numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: fecha, fechaVencimiento: vencimiento,
            renglones: [...nueva.renglones, { codigo: '—', concepto: 'Menos lo pagado con la declaración que se corrige', valor: pagado }],
            totalAPagar: aPagar, saldoAFavor: nueva.r34, estadoRevision: 'pendiente',
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
          id, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2026, periodo: 1, tipo: 'clausura',
          fechaCierre: cierre, numero: numero('ICA', 2026), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: sumarDias(cierre, 60),
          renglones: liq.renglones, totalAPagar: liq.r38, saldoAFavor: liq.r34, estadoRevision: 'revisada',
        })
        agregarPago(id, presentacion, liq.r38)
      }

      if (ins.estado !== 'activa') continue

      // Retención (ReteICA) y autorretención, bimestres 1 a 4 de 2026.
      VENCIMIENTOS_BIMESTRE_2026.forEach((vencimiento, i) => {
        const bimestre = i + 1
        for (const calidad of ['agente_retenedor', 'autorretenedor'] as const) {
          if (!ins.calidades.some((c) => c.calidad === calidad)) continue
          const diasMora = az.prob(0.1) ? az.entero(3, 60) : 0
          const presentacion = diasMora > 0 ? sumarDias(vencimiento, diasMora) : sumarDias(vencimiento, -az.entero(0, 15))
          const meses = Math.ceil(diasMora / 30)
          const renglones: Renglon[] = []
          let impuesto: number

          if (calidad === 'agente_retenedor') {
            const tarifas =
              cfg.reteica.modalidad === 'unica'
                ? [cfg.reteica.tarifaUnicaPorMil]
                : [tarifas2026.find((t) => t.sector === 'servicios')!.porMil, tarifas2026.find((t) => t.sector === 'comercial')!.porMil]
            let retenciones = 0
            for (const tarifa of tarifas) {
              const base = az.entero(15, 900) * 1_000_000
              const retencion = redondearMil((base * tarifa) / 1000)
              retenciones += retencion
              renglones.push({ codigo: '13–15', concepto: `Retención a ${tarifa} por mil sobre una base de ${(base / 1_000_000).toLocaleString('es-CO')} millones`, valor: retencion })
            }
            const devoluciones = az.prob(0.15) ? redondearMil(retenciones * az.num() * 0.1) : 0
            impuesto = retenciones - devoluciones
            renglones.push(
              { codigo: '16', concepto: 'Retenciones practicadas en el periodo', valor: retenciones },
              { codigo: '17', concepto: 'Devoluciones, anulaciones y retenciones en exceso', valor: devoluciones },
              { codigo: '18', concepto: 'Subtotal', valor: impuesto },
            )
          } else {
            const principal = tarifas2026.find((t) => t.ciiu === ins.actividades[0].ciiu)?.porMil ?? 7
            const tarifa = cfg.autorretencion.modalidad === 'plena' ? principal : (principal * cfg.autorretencion.porcentaje) / 100
            const base = redondearMil((perfil.ingresos / 6) * (0.8 + az.num() * 0.4))
            impuesto = redondearMil((base * tarifa) / 1000)
            renglones.push(
              { codigo: '1', concepto: 'Base gravable del bimestre', valor: base },
              { codigo: '2', concepto: `Autorretención a ${tarifa.toLocaleString('es-CO')} por mil`, valor: impuesto },
            )
          }

          const minima = redondearMil(cfg.sanciones.minimaUvt * UVT)
          const sancion = diasMora > 0 ? Math.max(redondearMil((impuesto * Math.min(meses * cfg.sanciones.extemporaneidad, 100)) / 100), minima) : 0
          const intereses = diasMora > 0 ? redondearMil(impuesto * 0.00067 * diasMora) : 0
          const total = impuesto + sancion + intereses
          renglones.push(
            { codigo: 'S', concepto: 'Sanción por extemporaneidad', valor: sancion },
            { codigo: 'I', concepto: 'Intereses de mora', valor: intereses },
            { codigo: 'T', concepto: 'Total a pagar', valor: total },
          )
          const revision = estadoRevisionAleatorio(az, bimestre === 4 ? 0.7 : 0.1)
          const id = `d${declaraciones.length + 1}`
          const esRete = calidad === 'agente_retenedor'
          declaraciones.push({
            adjuntos: [],
            id, municipioId: municipio.id, inscripcionId: ins.id, impuesto: esRete ? 'reteica' : 'autorretencion', vigencia: 2026, periodo: bimestre,
            tipo: 'inicial', numero: numero(esRete ? 'RET' : 'AUT', 2026), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: vencimiento,
            renglones, totalAPagar: total, saldoAFavor: 0, estadoRevision: revision.estado, observacion: revision.observacion,
          })
          if (az.prob(esRete ? 0.9 : 0.95)) agregarPago(id, presentacion, total)
        }
      })
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
    const vencimiento = VENCIMIENTO_ICA_2025[municipio.id]
    const presentacion = sumarDiasHabiles(hoy, -azAprobacion.entero(0, 9))
    const diasMora = Math.max(Math.round((Date.parse(presentacion) - Date.parse(vencimiento)) / 86400000), 0)
    const liq = liquidarIca(perfil, ins, cfg, tarifas, diasMora, 0)
    declaraciones.push({
      adjuntos: ANEXOS.ica.filter(() => azAprobacion.prob(0.45)).map((nombre) => ({ nombre, archivo: archivoAleatorio(azAprobacion, nombre, presentacion) })),
      id: `d${declaraciones.length + 1}`, municipioId: municipio.id, inscripcionId: ins.id, impuesto: 'ica', vigencia: 2025, periodo: 1, tipo: 'inicial',
      numero: numero('ICA', 2025), numeroFactura: numeroFactura(), fechaPresentacion: presentacion, fechaVencimiento: vencimiento, renglones: liq.renglones,
      totalAPagar: liq.r38, saldoAFavor: liq.r34, estadoRevision: 'pendiente', aprobacion: { estado: 'pendiente' },
    })
  }

  return {
    municipios: MUNICIPIOS.map((m) => ({ ...m })),
    usuarios: USUARIOS.map((u) => ({ ...u })),
    inscripciones,
    declaraciones,
    pagos,
    recaudoHistorico: generarHistorico(az, declaraciones, pagos),
    configuraciones: structuredClone(CONFIGURACIONES),
    actividades: structuredClone(ACTIVIDADES_POR_VIGENCIA),
  }
}

/**
 * Recaudo de los tres años anteriores, por mes. Toma la forma del año de lo recaudado
 * en 2026 y la escala hacia atrás con un crecimiento de cerca del 6 % anual.
 */
function generarHistorico(az: Azar, declaraciones: Declaracion[], pagos: Pago[]): RecaudoMensual[] {
  const porId = new Map(declaraciones.map((d) => [d.id, d]))
  const historico: RecaudoMensual[] = []

  for (const m of MUNICIPIOS) {
    const base = Array.from({ length: 12 }, () => ({ ica: 0, reteica: 0, autorretencion: 0 }))
    for (const p of pagos) {
      const d = porId.get(p.declaracionId)
      if (d?.municipioId !== m.id || !p.fecha.startsWith('2026')) continue
      base[Number(p.fecha.slice(5, 7)) - 1][d.impuesto] += p.valor
    }

    // Retención y autorretención se pagan todos los bimestres: se toma el promedio de los bimestres
    // de 2026 que ya tienen recaudo y se reparte entre sus dos meses como se repartió en 2026.
    const bimestral = (impuesto: Impuesto) => {
      const bimestres = [0, 2, 4, 6, 8, 10].map((i) => base[i][impuesto] + base[i + 1][impuesto]).filter((v) => v > 0)
      const total = bimestres.reduce((s, v) => s + v, 0)
      const primerMes = base.filter((_, i) => i % 2 === 0).reduce((s, b) => s + b[impuesto], 0)
      return { promedio: bimestres.length === 0 ? 0 : total / bimestres.length, primerMes: total === 0 ? 0.5 : primerMes / total }
    }
    const reteica = bimestral('reteica')
    const autorretencion = bimestral('autorretencion')
    const enMes = (b: { promedio: number; primerMes: number }, i: number) => b.promedio * (i % 2 === 0 ? b.primerMes : 1 - b.primerMes)

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
