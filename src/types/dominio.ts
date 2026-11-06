// Modelo de datos del mock. El dominio está explicado en docs/Dominio-ICA.md.

export type Rol = '1cero1' | 'admin_municipio' | 'funcionario'

export interface Municipio {
  id: string
  nombre: string
  departamento: string
  codigoDane: string
  activo: boolean
  /**
   * Fecha de salida a producción de cada formulario: desde ahí el aplicativo lo recibe; lo anterior quedó en otro sistema.
   * Los omisos de cada impuesto se revisan desde su fecha, y la del RIT decide si se puede juzgar una inscripción tardía.
   * La pone 1cero1 al activar el formulario por primera vez y no se cambia: desactivarlo y volverlo a activar la
   * conserva. El formulario que nunca se ha activado no la tiene.
   */
  enProduccionDesde: Partial<Record<Formulario, string>>
  /** Impuestos que el municipio gestiona en el aplicativo; los activa 1cero1. */
  impuestos: Record<Impuesto, boolean>
  /** El RIT del municipio está en el aplicativo (inscripciones y novedades); lo activa 1cero1. */
  rit: boolean
  /** Por formulario: antes de diligenciarlo se validan los datos del contribuyente contra el RIT. */
  validarContraRit: Record<Impuesto, boolean>
  /** Por formulario: el municipio aprueba la declaración antes de que se pueda pagar; lo activa 1cero1. */
  aprobacionPrevia: Record<Impuesto, boolean>
  /** El municipio carga el Asobancaria 2001 de los pagos con código de barras; aplica a todos sus pagos y lo activa 1cero1. */
  cargaAsobancaria: boolean
  /** Por formulario: el municipio recibe en su ventanilla el pago en efectivo; lo activa 1cero1. */
  pagoEfectivo: Record<Impuesto, boolean>
  /** Por formulario: el municipio recibe en su ventanilla cheques de gerencia; lo activa 1cero1. */
  pagoCheque: Record<Impuesto, boolean>
}

export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  cargo: string
  correo: string
  rol: Rol
  /** null solo para el rol 1cero1, que ve todos los municipios. */
  municipioId: string | null
  activo: boolean
}

// --- RIT ---

export type TipoPersona = 'natural' | 'juridica' | 'consorcio' | 'union_temporal' | 'patrimonio_autonomo'
export type Calidad = 'contribuyente' | 'agente_retenedor' | 'autorretenedor'
export type EstadoInscripcion = 'en_revision' | 'activa' | 'rechazada' | 'cancelada'
export type TipoNovedad = 'inscripcion' | 'actualizacion' | 'cancelacion'
export type EstadoNovedad = 'pendiente' | 'aprobada' | 'rechazada'

export interface CalidadInscrita {
  calidad: Calidad
  /** Fecha desde la que rige. */
  desde: string
  /** Norma o acto de designación (agentes y autorretenedores). */
  acto?: string
}

export interface Novedad {
  id: string
  tipo: TipoNovedad
  fecha: string
  descripcion: string
  estado: EstadoNovedad
  /** En una actualización, la calidad que se agrega. */
  calidad?: Calidad
  revisadaPor?: string
  fechaRevision?: string
  /** Respuesta que recibe el contribuyente al resolver la solicitud. */
  observacion?: string
  /** Documentos que la administración le envía con la respuesta. */
  documentosRespuesta?: Archivo[]
  /** Lo que diligenció el contribuyente en la inscripción o en la actualización: el formulario completo. */
  datos?: DatosRit
  /** Lo que diligenció en la cancelación, un formulario más corto. */
  cancelacion?: DatosCancelacion
  /** Documentos que cargó con la solicitud. */
  soportes: Soporte[]
}

/** Formulario de cancelación del RIT. */
export interface DatosCancelacion {
  fechaCese: string
  motivo: string
}

export interface Actividad {
  ciiu: string
  descripcion: string
  principal: boolean
}

/** Archivo cargado por el contribuyente. En el mock el contenido se genera al descargar. */
export interface Archivo {
  /** Solo en archivos cargados durante la demo: llave de su contenido en el navegador. */
  id?: string
  nombre: string
  /** Tamaño en bytes. */
  tamano: number
  fechaCarga: string
}

export interface Soporte {
  nombre: string
  entregado: boolean
  archivo?: Archivo
}

/** Anexo cargado con una declaración. */
export interface Adjunto {
  nombre: string
  archivo: Archivo
}

/** Persona que firma una declaración. */
export interface Firmante {
  tipoDocumento: 'CC' | 'CE'
  documento: string
  nombre: string
}

/** Contador o revisor fiscal que el inscrito registra en el RIT: el que firma sus declaraciones. */
export interface FirmanteContable extends Firmante {
  cargo: 'contador' | 'revisor_fiscal'
  /** Número de la tarjeta profesional que expide la Junta Central de Contadores. */
  tarjetaProfesional: string
}

export interface Inscripcion {
  id: string
  municipioId: string
  numeroRit: string
  tipoPersona: TipoPersona
  tipoDocumento: 'CC' | 'NIT' | 'CE'
  documento: string
  dv?: string
  nombre: string
  representanteLegal?: string
  direccion: string
  telefono: string
  correo: string
  /** Establecimientos que tiene en el municipio; puede ser 0 si ejerce la actividad sin uno. */
  establecimientos: number
  /** Solo quien está obligado a llevar contabilidad. */
  contador?: FirmanteContable
  fechaInicioActividades: string
  regimenSimple: boolean
  actividades: Actividad[]
  calidades: CalidadInscrita[]
  estado: EstadoInscripcion
  soportes: Soporte[]
  novedades: Novedad[]
}

/** Datos del formulario de inscripción y del de actualización. La inscripción guarda los del último formulario aprobado. */
export type DatosRit = Pick<
  Inscripcion,
  | 'tipoPersona'
  | 'tipoDocumento'
  | 'documento'
  | 'dv'
  | 'nombre'
  | 'representanteLegal'
  | 'direccion'
  | 'telefono'
  | 'correo'
  | 'establecimientos'
  | 'contador'
  | 'fechaInicioActividades'
  | 'regimenSimple'
  | 'actividades'
  | 'calidades'
>

// --- Declaraciones y pagos ---

/**
 * Los datos de la empresa o de la persona que declara, tal como se escriben en la declaración. Son los de ese día: no
 * cambian si después actualiza el RIT, y son lo único que se sabe de ella cuando el municipio no tiene el RIT o ella no
 * está inscrita.
 */
export type DatosContribuyente = Pick<Inscripcion, 'tipoPersona' | 'tipoDocumento' | 'documento' | 'dv' | 'nombre' | 'direccion' | 'telefono' | 'correo'> & {
  /** Solo lo pide el formulario del ICA anual (renglón 6). */
  establecimientos?: number
}

export type Impuesto = 'ica' | 'reteica' | 'autorretencion'
export type TipoDeclaracion = 'inicial' | 'correccion' | 'clausura'
export type EstadoPago = 'pagada' | 'parcial' | 'sin_pago' | 'saldo_a_favor' | 'ineficaz'

export interface Renglon {
  codigo: string
  concepto: string
  valor: number
}

export interface Declaracion {
  id: string
  municipioId: string
  /**
   * Su inscripción en el RIT. No la tiene si el municipio no tiene el RIT en el aplicativo, ni si el contribuyente no está
   * inscrito y el formulario no se valida contra el RIT.
   */
  inscripcionId?: string
  contribuyente: DatosContribuyente
  /**
   * Quien diligencia y firma la declaración: la persona natural misma o, en una empresa, su representante legal. Del
   * declarante solo se piden el tipo y el número de documento y el nombre.
   */
  declarante: Firmante
  /** Solo si el contribuyente está obligado a llevar contabilidad. */
  contador?: FirmanteContable
  impuesto: Impuesto
  vigencia: number
  /**
   * La del calendario del año gravable cuando se presentó: anual en el ICA; mensual, bimestral o trimestral en ReteICA y
   * AutoReteICA. No cambia si después el municipio cambia la periodicidad en el calendario.
   */
  periodicidad: Periodicidad
  /** El periodo dentro del año gravable: 1 en el ICA anual; el mes, el bimestre o el trimestre en ReteICA y AutoReteICA. */
  periodo: number
  tipo: TipoDeclaracion
  /** Radicado: la referencia de la declaración, que también acompaña el pago. */
  numero: string
  /** Número de factura con el que se identifica el pago. Solo dígitos. */
  numeroFactura: number
  corrigeA?: string
  /** Solo en clausura: fecha exacta de cierre. */
  fechaCierre?: string
  fechaPresentacion: string
  fechaVencimiento: string
  renglones: Renglon[]
  totalAPagar: number
  saldoAFavor: number
  /** Anexos que el municipio pide cargar con la declaración. */
  adjuntos: Adjunto[]
  aprobacion?: Aprobacion
}

/**
 * Aprobación previa: el visto bueno del municipio antes de que el contribuyente pague. Solo la tienen
 * las declaraciones radicadas con la aprobación previa activa en su formulario.
 */
export type Aprobacion =
  | { estado: 'pendiente' }
  /** La observación le llega al contribuyente en el correo; al rechazar es obligatoria. */
  | { estado: 'aprobada' | 'rechazada'; fecha: string; por: string; observacion?: string }

/** Estado de la aprobación previa al día de hoy: vencido el plazo, queda vencida o se aprueba sola (lib/reglas). */
export type EstadoAprobacion = 'por_aprobar' | 'vencida' | 'aprobada' | 'aprobada_automatica' | 'rechazada'

export interface Pago {
  id: string
  declaracionId: string
  fecha: string
  valor: number
  medio: string
  /** En los pagos en ventanilla: el número del recibo de caja y quién lo registró. */
  recibo?: string
  registradoPor?: string
}

export type EstadoCheque = 'en_canje' | 'pagado' | 'devuelto'

/**
 * Cheque de gerencia recibido en la ventanilla. Es un pago salvo buen cobro: solo cuando el banco
 * lo paga en el canje se vuelve un Pago, con la fecha en que se recibió.
 */
export interface Cheque {
  id: string
  declaracionId: string
  valor: number
  /** Banco que expidió el cheque. */
  banco: string
  numero: string
  /** Recibo de caja que se le entregó al contribuyente. */
  recibo: string
  fechaRecibo: string
  recibidoPor: string
  estado: EstadoCheque
  fechaResolucion?: string
  resueltoPor?: string
  motivoDevolucion?: string
}

// --- Configuración por municipio ---

export type Sector = 'industrial' | 'comercial' | 'servicios' | 'financiero'

export interface Tarifa {
  ciiu: string
  descripcion: string
  sector: Sector
  porMil: number
}

/** Actividades y tarifas de un año gravable. Las carga el administrador del municipio con la plantilla de Excel. */
export interface ActividadesVigencia {
  municipioId: string
  vigencia: number
  tarifas: Tarifa[]
  cargadoPor: string
  fechaCarga: string
  /** Nombre del Excel del que salieron. */
  archivo: string
}

/** Rango de fechas de pago (inclusive) con su porcentaje de descuento. */
export interface TramoProntoPago {
  desde: string
  hasta: string
  porcentaje: number
}

/** El ICA es anual; ReteICA y AutoReteICA pueden ser mensuales, bimestrales o trimestrales, cada una por su lado. */
export type Periodicidad = 'anual' | 'mensual' | 'bimestral' | 'trimestral'

export interface VencimientoPeriodo {
  /** 1 es el primer periodo del año (el ICA anual tiene solo el 1). */
  periodo: number
  /**
   * Una sola fecha para todos o, si el calendario las separa por el último dígito del NIT o de la cédula,
   * diez: la posición es el dígito (la del 0 en la posición 0).
   */
  fechas: string[]
}

/** Vencimientos de un formulario en un año gravable. */
export interface VencimientosFormulario {
  periodicidad: Periodicidad
  /** La fecha cambia según el último dígito del NIT o de la cédula del contribuyente. */
  porDigito: boolean
  periodos: VencimientoPeriodo[]
}

/**
 * Calendario de un año gravable, con los vencimientos de cada formulario por separado. El ICA anual
 * de ese año se presenta en vigencia + 1; ReteICA y AutoReteICA, durante el mismo año.
 */
export type CalendarioVigencia = {
  vigencia: number
  /** Acto del municipio que fija el calendario. */
  decreto?: string
  /**
   * Cuándo y quién lo guardó por primera vez. Las declaraciones del año presentadas antes quedan marcadas: se liquidaron
   * sin el calendario. Un año recién agregado no lo tiene hasta que se guarda.
   */
  cargado?: CargaCalendario
} & Record<Impuesto, VencimientosFormulario>

export interface CargaCalendario {
  fecha: string
  /** Nombre de quien lo guardó, como era en ese momento. */
  por: string
}

export interface ConfigMunicipio {
  municipioId: string
  declaracionEnCeros: boolean
  /**
   * La ReteICA o AutoReteICA presentada a tiempo sin el pago total no queda ineficaz si se paga completa dentro de los
   * 2 meses siguientes al vencimiento (art. 580-1 del Estatuto Tributario).
   */
  pagoRetencionEnDosMeses: boolean
  cancelacionRitAutomatica: boolean
  /** Los funcionarios no ven en Inicio lo que ha recaudado el municipio. */
  ocultarRecaudoAFuncionarios: boolean
  correccionABaja: 'proyecto_589' | 'correccion_directa'
  /** El concejo fija los tramos para cada año gravable; fuera de ellos no hay descuento. */
  prontoPago: { activo: boolean; porVigencia: { vigencia: number; tramos: TramoProntoPago[] }[] }
  /** Calendario tributario de vencimientos por año gravable, también de años pasados. */
  calendarioTributario: { porVigencia: CalendarioVigencia[] }
  anticipoPorcentaje: number
  sobretasaBomberil: { activa: boolean; porcentaje: number }
  reteica: {
    modalidad: 'unica' | 'actividad' | 'concepto'
    tarifaUnicaPorMil: number
    baseMinimaServiciosUvt: number
    baseMinimaComprasUvt: number
  }
  autorretencion: { modalidad: 'plena' | 'porcentaje'; porcentaje: number }
  sanciones: {
    extemporaneidad: number
    extemporaneidadEmplazamiento: number
    correccion: number
    correccionEmplazamiento: number
    minimaUvt: number
  }
  plazoInscripcionMeses: number
  /** Aplica a los formularios con la aprobación previa activa. */
  aprobacionPrevia: {
    /** Días hábiles desde la radicación para aprobar o rechazar. */
    plazoDiasHabiles: number
    /** Si se vence el plazo sin revisión: se aprueba sola o solo se alerta. */
    alVencer: 'aprobar' | 'alertar'
    /** Días hábiles que vale el recibo de pago desde la aprobación. */
    vigenciaReciboDiasHabiles: number
  }
  /** Formularios que el municipio desactivó para los contribuyentes, con su motivo. Solo cuentan los que tiene activos 1cero1. */
  formulariosDesactivados: Partial<Record<Formulario, FormularioDesactivado>>
  /** Se reciben cheques de gerencia por menos del saldo pendiente; si no, el cheque debe cubrirlo completo. */
  chequeParcial: boolean
}

/** El RIT o el formulario de uno de los impuestos. */
export type Formulario = Impuesto | 'rit'

export interface FormularioDesactivado {
  motivo: string
  fecha: string
  /** Nombre de quien lo desactivó. */
  por: string
}

/** Recaudo consolidado de un mes de años anteriores: la demo solo trae pagos uno a uno del año en curso. */
export interface RecaudoMensual {
  municipioId: string
  anio: number
  /** 1 a 12. */
  mes: number
  valores: Record<Impuesto, number>
}

// --- Bitácora ---

/**
 * Una petición a la API que cambió algo, como la guarda el back al terminar cada endpoint: quién y cuándo, el
 * controlador, la acción, el endpoint, los datos enviados y si salió bien. No trae el valor anterior: para eso el back
 * tendría que consultarlo en cada petición. Solo la ve 1cero1.
 */
export interface RegistroBitacora {
  /** Consecutivo: el registro más reciente tiene el número más alto, así que ordena aunque dos tengan la misma hora. */
  id: number
  /** Fecha y hora local de la petición, AAAA-MM-DDTHH:MM. */
  fechaHora: string
  /** Quién la hizo, como era en ese momento: el usuario puede cambiar o eliminarse después. */
  usuario: { id: string; nombre: string; rol: Rol }
  /** Municipio de lo que se cambió; null en lo que no es de un municipio, como el inicio de sesión de 1cero1. */
  municipioId: string | null
  /** Nombres tal como vienen del back: "Pagos", "RegistrarPagoVentanilla", "POST /api/pagos/ventanilla". */
  controlador: string
  accion: string
  endpoint: string
  /** Lo que se envió en el cuerpo o en la URL, tal como llegó. */
  datos: Record<string, unknown>
  /** Si la petición salió bien: el back registra también las que fallan. */
  exito: boolean
}

export interface Datos {
  municipios: Municipio[]
  usuarios: Usuario[]
  inscripciones: Inscripcion[]
  declaraciones: Declaracion[]
  pagos: Pago[]
  cheques: Cheque[]
  recaudoHistorico: RecaudoMensual[]
  configuraciones: ConfigMunicipio[]
  actividades: ActividadesVigencia[]
  /** Datos de prueba, más lo que se hace en el navegador. */
  bitacora: RegistroBitacora[]
}
