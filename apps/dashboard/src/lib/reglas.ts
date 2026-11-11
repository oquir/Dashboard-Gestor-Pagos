// Reglas del dominio que usa el dashboard (ver docs/Dominio-ICA.md, secciones 5 y 6).
import type {
  ActividadesVigencia,
  Archivo,
  CausalNoPresentada,
  Cheque,
  ConfigMunicipio,
  Declaracion,
  EstadoAprobacion,
  EstadoCorreccion,
  EstadoPago,
  Impuesto,
  Inscripcion,
  Pago,
  Sector,
  Tarifa,
} from '../types'
import { diferenciaDias, sumarMeses } from '../utils'

/** UVT 2026 (dato que caduca, sección 7 del dominio). */
export const UVT = 52374

/** Topes de ley: el municipio solo puede bajarlos (art. 59, Ley 788 de 2002). */
export const SANCIONES_LEY: ConfigMunicipio['sanciones'] = {
  extemporaneidad: 5,
  extemporaneidadEmplazamiento: 10,
  correccion: 10,
  correccionEmplazamiento: 20,
  minimaUvt: 10,
}

/** Tope de la extemporaneidad, en % del impuesto: antes del emplazamiento para declarar (art. 641) y después (art. 642). */
export const TOPE_EXTEMPORANEIDAD = 100
export const TOPE_EXTEMPORANEIDAD_EMPLAZAMIENTO = 200

/**
 * Sanción por extemporaneidad: la tasa del municipio por cada mes o fracción de retardo desde el vencimiento, sobre el
 * impuesto a cargo, con su tope y sin bajar de la mínima. Quien declara después de notificado el emplazamiento para
 * declarar usa la tasa y el tope del art. 642; si no, los del art. 641. Sin impuesto a cargo queda la mínima: la sanción
 * sobre los ingresos brutos no se modela.
 */
export function sancionExtemporaneidad(
  base: number,
  diasMora: number,
  sanciones: ConfigMunicipio['sanciones'],
  emplazado = false,
) {
  if (diasMora <= 0) return 0
  const meses = Math.ceil(diasMora / 30)
  const tasa = emplazado ? sanciones.extemporaneidadEmplazamiento : sanciones.extemporaneidad
  const tope = emplazado ? TOPE_EXTEMPORANEIDAD_EMPLAZAMIENTO : TOPE_EXTEMPORANEIDAD
  return Math.max(
    redondearMil((base * Math.min(meses * tasa, tope)) / 100),
    redondearMil(sanciones.minimaUvt * UVT),
  )
}

export const ANTICIPO_MAXIMO = 40

/** Rango de tarifas por mil; el sector financiero tiene reglas propias. */
export const TOPES_TARIFA: Record<Exclude<Sector, 'financiero'>, [number, number]> = {
  industrial: [2, 7],
  comercial: [2, 10],
  servicios: [2, 10],
}

export function fueraDeTope({ sector, porMil }: Tarifa) {
  if (sector === 'financiero') return false
  const [min, max] = TOPES_TARIFA[sector]
  return porMil < min || porMil > max
}

/** Actividades que rigen en el año gravable: las de ese año o, si no se han cargado, las del último año anterior. */
export const actividadesDe = (
  cargas: ActividadesVigencia[],
  municipioId: string,
  vigencia: number,
) =>
  cargas
    .filter((c) => c.municipioId === municipioId && c.vigencia <= vigencia)
    .sort((a, b) => b.vigencia - a.vigencia)[0]

export function totalPagado(declaracionId: string, pagos: Pago[]) {
  return pagos
    .filter((p) => p.declaracionId === declaracionId)
    .reduce((suma, p) => suma + p.valor, 0)
}

/** Lo que está en cheques de gerencia en canje: aún no es pago, pero tampoco se puede volver a cobrar. */
export function totalEnCanje(declaracionId: string, cheques: Cheque[]) {
  return cheques
    .filter((c) => c.declaracionId === declaracionId && c.estado === 'en_canje')
    .reduce((suma, c) => suma + c.valor, 0)
}

/** Sanción por cheque devuelto sin causa justificada (art. 731 del Código de Comercio); en la demo solo se avisa. */
export const SANCION_CHEQUE_DEVUELTO = 0.2

/** Meses que tiene el agente para consignar lo retenido después del vencimiento (art. 402 del Código Penal y art. 580-1 del ET). */
export const MESES_PARA_CONSIGNAR = 2

/**
 * Último día de un plazo en meses: el mismo día del mes, o el último día del mes si ese mes es más corto (el 31 de
 * diciembre más 2 meses da el 28 de febrero). Si cae en sábado o domingo, pasa al día hábil siguiente (art. 62 de la
 * Ley 4 de 1913); la demo no descuenta los festivos.
 */
export function plazoEnMeses(desde: string, meses: number) {
  const limite = new Date(`${sumarMeses(desde, meses)}T12:00:00Z`)
  while (limite.getUTCDay() % 6 === 0) limite.setUTCDate(limite.getUTCDate() + 1)
  return limite.toISOString().slice(0, 10)
}

/** Último día para consignar la ReteICA o la AutoReteICA: dos meses después del vencimiento. */
export const limiteConsignacion = (vencimiento: string) =>
  plazoEnMeses(vencimiento, MESES_PARA_CONSIGNAR)

/**
 * ICA anual admite pago parcial y saldo a favor; ReteICA y autorretención sin pago total son ineficaces y no
 * producen saldo a favor. Si el municipio da el plazo de 2 meses (art. 580-1 ET), la que se presentó a tiempo no es
 * ineficaz mientras ese plazo no pase: queda sin pago o con pago parcial.
 */
export function estadoPago(
  declaracion: Declaracion,
  pagos: Pago[],
  cfg: ConfigMunicipio | undefined,
  hoy: string,
): EstadoPago {
  const pagado = totalPagado(declaracion.id, pagos)
  if (declaracion.impuesto === 'ica') {
    if (declaracion.totalAPagar === 0)
      return declaracion.saldoAFavor > 0 ? 'saldo_a_favor' : 'pagada'
    if (pagado >= declaracion.totalAPagar) return 'pagada'
    return pagado > 0 ? 'parcial' : 'sin_pago'
  }
  if (pagado >= declaracion.totalAPagar) return 'pagada'
  const enPlazo =
    cfg?.pagoRetencionEnDosMeses &&
    declaracion.fechaPresentacion <= declaracion.fechaVencimiento &&
    hoy <= limiteConsignacion(declaracion.fechaVencimiento)
  if (enPlazo) return pagado > 0 ? 'parcial' : 'sin_pago'
  return 'ineficaz'
}

/** Descuento por pronto pago del año gravable para un pago en esa fecha; 0 si no cae en ningún tramo. */
export function porcentajeProntoPago(cfg: ConfigMunicipio, vigencia: number, fecha: string) {
  if (!cfg.prontoPago.activo) return 0
  const tramos = cfg.prontoPago.porVigencia.find((v) => v.vigencia === vigencia)?.tramos ?? []
  return tramos.find((t) => t.desde <= fecha && fecha <= t.hasta)?.porcentaje ?? 0
}

/** Suma días hábiles (resta, si son negativos): de lunes a viernes. La demo no descuenta los festivos. */
export function sumarDiasHabiles(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  for (let faltan = Math.abs(dias); faltan > 0;) {
    d.setUTCDate(d.getUTCDate() + Math.sign(dias))
    if (d.getUTCDay() % 6 !== 0) faltan--
  }
  return d.toISOString().slice(0, 10)
}

/** Días hábiles que faltan de `desde` a `hasta`; 0 si es el mismo día, negativo si ya pasó. */
export function diasHabilesEntre(desde: string, hasta: string): number {
  if (hasta < desde) return -diasHabilesEntre(hasta, desde)
  let dias = 0
  while (sumarDiasHabiles(desde, dias + 1) <= hasta) dias++
  return dias
}

export interface SituacionAprobacion {
  estado: EstadoAprobacion
  /** Último día para aprobar o rechazar. */
  limite: string
  /** Día en que se resolvió; en la aprobación automática, el día límite. */
  fecha?: string
  por?: string
  observacion?: string
  /** Solo en la rechazada: la causal del art. 580. */
  causal?: CausalNoPresentada
  documentos?: Archivo[]
  /** Hasta cuándo vale el recibo de pago que se envía al aprobar. */
  reciboHasta?: string
}

/**
 * Aprobación previa de la declaración al día de hoy. El plazo cuenta desde la radicación y, si
 * se radicó a tiempo, no pasa del vencimiento. Vencido el plazo sin revisión, el municipio decide
 * si se aprueba sola o solo se alerta. Descuento, sanciones e intereses se liquidan con la fecha
 * de radicación: la demora del municipio no se le cobra al contribuyente.
 */
export function aprobacionDe(
  d: Declaracion,
  cfg: ConfigMunicipio,
  hoy: string,
): SituacionAprobacion | undefined {
  if (!d.aprobacion) return undefined
  const { plazoDiasHabiles, alVencer, vigenciaReciboDiasHabiles } = cfg.aprobacionPrevia
  const plazo = sumarDiasHabiles(d.fechaPresentacion, plazoDiasHabiles)
  const limite =
    d.fechaPresentacion <= d.fechaVencimiento && d.fechaVencimiento < plazo
      ? d.fechaVencimiento
      : plazo
  const reciboHasta = (fecha: string) => sumarDiasHabiles(fecha, vigenciaReciboDiasHabiles)
  const a = d.aprobacion
  if (a.estado === 'aprobada') return { ...a, limite, reciboHasta: reciboHasta(a.fecha) }
  if (a.estado === 'rechazada') return { ...a, limite }
  if (hoy <= limite) return { estado: 'por_aprobar', limite }
  return alVencer === 'aprobar'
    ? { estado: 'aprobada_automatica', limite, fecha: limite, reciboHasta: reciboHasta(limite) }
    : { estado: 'vencida', limite }
}

/** Mientras no se apruebe, el contribuyente no puede pagar: la declaración aún no es deuda. */
export const sePuedePagar = (a: SituacionAprobacion | undefined) =>
  !a || a.estado === 'aprobada' || a.estado === 'aprobada_automatica'

/** Espera la aprobación previa: mientras tanto el contribuyente no puede pagar. */
export const esperaAprobacion = (a: SituacionAprobacion | undefined) =>
  a?.estado === 'por_aprobar' || a?.estado === 'vencida'

// --- Corrección a la baja (art. 589 del Estatuto Tributario) ---

/** Plazo para corregir a la baja: el año siguiente al vencimiento del plazo para declarar (art. 589). */
export const MESES_PARA_CORREGIR_A_LA_BAJA = 12

/** Meses que tiene el municipio para resolver la solicitud de corrección a la baja; si no responde, se acepta sola (art. 589 anterior). */
export const MESES_PARA_RESOLVER_CORRECCION = 6

/**
 * Sanción por rechazar por improcedente la solicitud de corrección a la baja: 20 % del menor valor que se pidió (art. 589
 * anterior). La impone la administración en el mismo acto, después de un proceso previo (Corte Constitucional, C-005 de
 * 1998); el dashboard solo la informa.
 */
export const SANCION_RECHAZO_CORRECCION = 0.2

/** Código del renglón con lo que se pagó con la declaración que se corrige: la corrección lo trae como crédito. */
export const CODIGO_PAGADO_CON_LA_CORREGIDA = '—'

/**
 * Valor a pagar que liquida la declaración: el total del ICA anual (renglón 38) o de la retención, antes de restar lo
 * que se pagó con la declaración que corrige.
 */
export const valorLiquidado = (d: Declaracion) =>
  d.renglones.find((r) => r.codigo === '38' || r.codigo === 'T')?.valor ?? d.totalAPagar

/** Renglón del impuesto a cargo, sobre el que se liquida la extemporaneidad: el total del ICA o el subtotal de la retención. */
const RENGLON_IMPUESTO: Record<Impuesto, string> = { ica: '25', reteica: '18', autorretencion: '2' }

export const impuestoACargo = (d: Declaracion) =>
  d.renglones.find((r) => r.codigo === RENGLON_IMPUESTO[d.impuesto])?.valor ?? 0

/** Las sanciones que liquida la declaración: el renglón 31 del ICA o la "S" de la retención. */
export const sancionLiquidada = (d: Declaracion) =>
  d.renglones
    .filter((r) => r.codigo === '31' || r.codigo === 'S')
    .reduce((suma, r) => suma + r.valor, 0)

/**
 * La corrección baja el valor a pagar o sube el saldo a favor de la declaración que corrige. El valor a pagar es el
 * resultado final de la liquidación, no solo el impuesto a cargo (DIAN, conceptos 901809 de 2021 y 13304 de 2025).
 */
export const esCorreccionABaja = (d: Declaracion, corregida: Declaracion | undefined) =>
  d.tipo === 'correccion' &&
  corregida !== undefined &&
  (valorLiquidado(d) < valorLiquidado(corregida) || d.saldoAFavor > corregida.saldoAFavor)

/** Lo que la corrección le baja al valor a pagar, más lo que le sube al saldo a favor. */
export const menorValor = (d: Declaracion, corregida: Declaracion) =>
  Math.max(valorLiquidado(corregida) - valorLiquidado(d), 0) +
  Math.max(d.saldoAFavor - corregida.saldoAFavor, 0)

/**
 * Lo que se pagó con la declaración que se corrige por encima de lo que liquida la corrección. Es un pago en exceso, no
 * un saldo a favor de la declaración: el contribuyente lo pide en devolución o compensación.
 */
export const pagoEnExceso = (d: Declaracion) =>
  Math.max(
    (d.renglones.find((r) => r.codigo === CODIGO_PAGADO_CON_LA_CORREGIDA)?.valor ?? 0) -
      valorLiquidado(d),
    0,
  )

/** Último día para corregir a la baja: un año después del vencimiento, o el día hábil siguiente. */
export const limiteCorreccionABaja = (vencimiento: string) =>
  plazoEnMeses(vencimiento, MESES_PARA_CORREGIR_A_LA_BAJA)

export interface SituacionCorreccion {
  estado: EstadoCorreccion
  /** Último día para resolverla. Después se acepta sola. */
  limite: string
  /** Día en que se resolvió; en la aceptación por silencio, el día límite. */
  fecha?: string
  por?: string
  observacion?: string
  /** Lo que explica el contribuyente al radicarla. */
  motivo: string
}

/**
 * Solicitud de corrección a la baja al día de hoy, con el trámite del art. 589 anterior a la Ley 1819 de 2016: el
 * municipio tiene 6 meses desde la radicación para aceptarla o rechazarla y, si no responde, el proyecto reemplaza a la
 * declaración (silencio positivo). Es undefined en las declaraciones que no se radicaron como solicitud.
 */
export function situacionCorreccion(d: Declaracion, hoy: string): SituacionCorreccion | undefined {
  const s = d.solicitudCorreccion
  if (!s) return undefined
  const limite = plazoEnMeses(d.fechaPresentacion, MESES_PARA_RESOLVER_CORRECCION)
  if (s.estado !== 'pendiente') return { ...s, limite }
  if (hoy <= limite) return { estado: 'por_resolver', limite, motivo: s.motivo }
  return { estado: 'aceptada_por_silencio', limite, fecha: limite, motivo: s.motivo }
}

/** La corrección reemplaza a la que corrige: no es una solicitud, o se aceptó, expresamente o por silencio. */
export const correccionVigente = (s: SituacionCorreccion | undefined) =>
  !s || s.estado === 'aceptada' || s.estado === 'aceptada_por_silencio'

/** Espera que el municipio la resuelva: si no lo hace antes del límite, se acepta sola. */
export const correccionPorResolver = (s: SituacionCorreccion | undefined) =>
  s?.estado === 'por_resolver'

/**
 * Las declaraciones que reemplazó una corrección vigente. La solicitud de corrección que no se ha aceptado no reemplaza
 * a la que corrige: esa sigue vigente.
 */
export const reemplazadas = (
  declaraciones: Declaracion[],
  situacion: (d: Declaracion) => SituacionCorreccion | undefined,
) =>
  new Set(
    declaraciones.flatMap((d) =>
      d.corrigeA && correccionVigente(situacion(d)) ? [d.corrigeA] : [],
    ),
  )

export const redondearMil = (valor: number) => Math.round(valor / 1000) * 1000

/** Renglones de subtotal y total de la liquidación (se resaltan en pantalla y en el PDF). */
export const RENGLONES_TOTALES = new Set(['16', '25', '33', '34', '38', '18', 'T'])

/** El trámite más reciente del RIT: inscripción, actualización o cancelación. */
export const ultimoTramite = (i: Inscripcion) =>
  i.novedades.reduce((ultimo, n) => (n.fecha >= ultimo.fecha ? n : ultimo))

/**
 * Días de retraso de una inscripción en el RIT: el plazo corre desde el inicio de actividades (docs/Pendientes-y-decisiones.md §3.3).
 * Es null si se inscribió a tiempo o si el plazo vencía antes de que el RIT saliera a producción: entonces le tocaba
 * inscribirse en el sistema anterior y el aplicativo no sabe si lo hizo.
 */
export function diasInscripcionTardia(
  inicioActividades: string,
  radicado: string,
  plazoMeses: number,
  ritDesde: string,
) {
  const limite = sumarMeses(inicioActividades, plazoMeses)
  if (limite < ritDesde || radicado <= limite) return null
  return { limite, dias: diferenciaDias(limite, radicado) }
}
