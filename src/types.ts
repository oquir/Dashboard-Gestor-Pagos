// Modelo de datos del mock. El dominio está explicado en docs/Dominio-ICA.md.

export type Rol = '1cero1' | 'admin_municipio' | 'funcionario'

export interface Municipio {
  id: string
  nombre: string
  departamento: string
  codigoDane: string
  activo: boolean
  /** Impuestos que el municipio gestiona en el aplicativo; los activa 1cero1. */
  impuestos: Record<Impuesto, boolean>
  /** El RIT del municipio está en el aplicativo (inscripciones y novedades); lo activa 1cero1. */
  rit: boolean
  /** Por formulario: antes de diligenciarlo se validan los datos del declarante contra el RIT. */
  validarContraRit: Record<Impuesto, boolean>
  /** Por formulario: el municipio aprueba la declaración antes de que se pueda pagar; lo activa 1cero1. */
  aprobacionPrevia: Record<Impuesto, boolean>
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
  | 'fechaInicioActividades'
  | 'regimenSimple'
  | 'actividades'
  | 'calidades'
>

// --- Declaraciones y pagos ---

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
  inscripcionId: string
  impuesto: Impuesto
  vigencia: number
  /** 1 en el ICA anual; bimestre (1–6) en retención y autorretención. */
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

export interface ConfigMunicipio {
  municipioId: string
  periodicidadRetencion: 'bimestral' | 'mensual'
  formularioConjunto: boolean
  declaracionEnCeros: boolean
  cancelacionRitAutomatica: boolean
  /** Los funcionarios no ven en Inicio lo que ha recaudado el municipio. */
  ocultarRecaudoAFuncionarios: boolean
  correccionABaja: 'proyecto_589' | 'correccion_directa'
  /** El concejo fija los tramos para cada año gravable; fuera de ellos no hay descuento. */
  prontoPago: { activo: boolean; porVigencia: { vigencia: number; tramos: TramoProntoPago[] }[] }
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
}

/** Recaudo consolidado de un mes de años anteriores: la demo solo trae pagos uno a uno del año en curso. */
export interface RecaudoMensual {
  municipioId: string
  anio: number
  /** 1 a 12. */
  mes: number
  valores: Record<Impuesto, number>
}

export interface Datos {
  municipios: Municipio[]
  usuarios: Usuario[]
  inscripciones: Inscripcion[]
  declaraciones: Declaracion[]
  pagos: Pago[]
  recaudoHistorico: RecaudoMensual[]
  configuraciones: ConfigMunicipio[]
  actividades: ActividadesVigencia[]
}
