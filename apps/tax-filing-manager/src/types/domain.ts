// Modelo de datos del mock. El dominio está explicado en docs/Dominio-ICA.md.

export type Role = '1cero1' | 'municipality_admin' | 'official'

export interface Municipality {
  id: string
  name: string
  department: string
  daneCode: string
  isActive: boolean
  /**
   * Fecha de salida a producción de cada formulario: desde ahí el aplicativo lo recibe; lo anterior quedó en otro sistema.
   * Los omisos de cada impuesto se revisan desde su fecha, y la del RIT decide si se puede juzgar una inscripción tardía.
   * La pone 1cero1 al activar el formulario por primera vez y no se cambia: desactivarlo y volverlo a activar la
   * conserva. El formulario que nunca se ha activado no la tiene.
   */
  inProductionSince: Partial<Record<Form, string>>
  /** Impuestos que el municipio gestiona en el aplicativo; los activa 1cero1. */
  taxes: Record<Tax, boolean>
  /** El RIT del municipio está en el aplicativo (inscripciones y novedades); lo activa 1cero1. */
  rit: boolean
  /** Por formulario: antes de diligenciarlo se validan los datos del contribuyente contra el RIT. */
  validateAgainstRit: Record<Tax, boolean>
  /** Por formulario: el municipio aprueba la declaración antes de que se pueda pagar; lo activa 1cero1. */
  priorApproval: Record<Tax, boolean>
  /** El municipio carga el Asobancaria 2001 de los pagos con código de barras; aplica a todos sus pagos y lo activa 1cero1. */
  asobancariaUpload: boolean
  /** Por formulario: el municipio recibe en su ventanilla el pago en efectivo; lo activa 1cero1. */
  cashPayment: Record<Tax, boolean>
  /** Por formulario: el municipio recibe en su ventanilla cheques de gerencia; lo activa 1cero1. */
  checkPayment: Record<Tax, boolean>
}

export interface User {
  id: string
  firstNames: string
  lastNames: string
  jobTitle: string
  email: string
  role: Role
  /** null solo para el rol 1cero1, que ve todos los municipios. */
  municipalityId: string | null
  isActive: boolean
}

// --- RIT ---

export type PersonType = 'natural' | 'legal' | 'consortium' | 'temporary_union' | 'autonomous_trust'
export type Capacity = 'taxpayer' | 'withholding_agent' | 'self_withholder'
export type RegistrationStatus = 'under_review' | 'active' | 'rejected' | 'cancelled'
export type RitChangeKind = 'registration' | 'update' | 'cancellation'
export type RitChangeStatus = 'pending' | 'approved' | 'rejected'

export interface RegisteredCapacity {
  capacity: Capacity
  /** Fecha desde la que rige. */
  from: string
  /** Norma o acto de designación (agentes y autorretenedores). */
  act?: string
}

export interface RitChange {
  id: string
  kind: RitChangeKind
  date: string
  description: string
  status: RitChangeStatus
  /** En una actualización, la calidad que se agrega. */
  capacity?: Capacity
  reviewedBy?: string
  reviewDate?: string
  /** Respuesta que recibe el contribuyente al resolver la solicitud. */
  observation?: string
  /** Documentos que la administración le envía con la respuesta. */
  replyDocuments?: StoredFile[]
  /** Lo que diligenció el contribuyente en la inscripción o en la actualización: el formulario completo. */
  data?: RitData
  /** Lo que diligenció en la cancelación, un formulario más corto. */
  cancellation?: CancellationData
  /** Documentos que cargó con la solicitud. */
  supports: Support[]
}

/** Formulario de cancelación del RIT. */
export interface CancellationData {
  cessationDate: string
  reason: string
}

export interface Activity {
  ciiu: string
  description: string
  main: boolean
}

/** Archivo cargado por el contribuyente. En el mock el contenido se genera al descargar. */
export interface StoredFile {
  /** Solo en archivos cargados durante la demo: llave de su contenido en el navegador. */
  id?: string
  name: string
  /** Tamaño en bytes. */
  size: number
  uploadDate: string
}

export interface Support {
  name: string
  delivered: boolean
  file?: StoredFile
}

/** Anexo cargado con una declaración. */
export interface Attachment {
  name: string
  file: StoredFile
}

/** Persona que firma una declaración. */
export interface Signer {
  documentType: 'CC' | 'CE'
  document: string
  name: string
}

/** Contador o revisor fiscal que el inscrito registra en el RIT: el que firma sus declaraciones. */
export interface AccountingSigner extends Signer {
  jobTitle: 'accountant' | 'statutory_auditor'
  /** Número de la tarjeta profesional que expide la Junta Central de Contadores. */
  professionalCard: string
}

export interface Registration {
  id: string
  municipalityId: string
  ritNumber: string
  personType: PersonType
  documentType: 'CC' | 'NIT' | 'CE'
  document: string
  dv?: string
  name: string
  legalRepresentative?: string
  address: string
  phone: string
  email: string
  /** Establecimientos que tiene en el municipio; puede ser 0 si ejerce la actividad sin uno. */
  establishments: number
  /** Solo quien está obligado a llevar contabilidad. */
  accountant?: AccountingSigner
  activitiesStartDate: string
  simpleRegime: boolean
  activities: Activity[]
  capacities: RegisteredCapacity[]
  status: RegistrationStatus
  supports: Support[]
  ritChanges: RitChange[]
}

/** Datos del formulario de inscripción y del de actualización. La inscripción guarda los del último formulario aprobado. */
export type RitData = Pick<
  Registration,
  | 'personType'
  | 'documentType'
  | 'document'
  | 'dv'
  | 'name'
  | 'legalRepresentative'
  | 'address'
  | 'phone'
  | 'email'
  | 'establishments'
  | 'accountant'
  | 'activitiesStartDate'
  | 'simpleRegime'
  | 'activities'
  | 'capacities'
>

// --- Declaraciones y pagos ---

/**
 * Los datos de la empresa o de la persona que declara, tal como se escriben en la declaración. Son los de ese día: no
 * cambian si después actualiza el RIT, y son lo único que se sabe de ella cuando el municipio no tiene el RIT o ella no
 * está inscrita.
 */
export type TaxpayerData = Pick<
  Registration,
  'personType' | 'documentType' | 'document' | 'dv' | 'name' | 'address' | 'phone' | 'email'
> & {
  /** Solo lo pide el formulario del ICA anual (renglón 6). */
  establishments?: number
}

export type Tax = 'ica' | 'reteica' | 'selfWithholding'
export type DeclarationKind = 'initial' | 'correction' | 'closure'
export type PaymentStatus = 'paid' | 'partial' | 'no_payment' | 'credit_balance' | 'ineffective'

export interface Line {
  code: string
  concept: string
  value: number
}

export interface Declaration {
  id: string
  municipalityId: string
  /**
   * Su inscripción en el RIT. No la tiene si el municipio no tiene el RIT en el aplicativo, ni si el contribuyente no está
   * inscrito y el formulario no se valida contra el RIT.
   */
  registrationId?: string
  taxpayer: TaxpayerData
  /**
   * Quien diligencia y firma la declaración: la persona natural misma o, en una empresa, su representante legal. Del
   * declarante solo se piden el tipo y el número de documento y el nombre.
   */
  filer: Signer
  /** Solo si el contribuyente está obligado a llevar contabilidad. */
  accountant?: AccountingSigner
  tax: Tax
  fiscalYear: number
  /**
   * La del calendario del año gravable cuando se presentó: anual en el ICA; mensual, bimestral o trimestral en ReteICA y
   * AutoReteICA. No cambia si después el municipio cambia la periodicidad en el calendario.
   */
  frequency: Frequency
  /** El periodo dentro del año gravable: 1 en el ICA anual; el mes, el bimestre o el trimestre en ReteICA y AutoReteICA. */
  period: number
  kind: DeclarationKind
  /** Radicado: la referencia de la declaración, que también acompaña el pago. */
  number: string
  /** Número de factura con el que se identifica el pago. Solo dígitos. */
  invoiceNumber: number
  correctsId?: string
  /** Solo en clausura: fecha exacta de cierre. */
  closingDate?: string
  filingDate: string
  dueDate: string
  lines: Line[]
  totalToPay: number
  creditBalance: number
  /** Anexos que el municipio pide cargar con la declaración. */
  attachments: Attachment[]
  approval?: Approval
  /** Solo en las correcciones a la baja que se radicaron como solicitud, con el trámite del art. 589 anterior. */
  correctionApplication?: CorrectionApplication
}

/**
 * Aprobación previa: el visto bueno del municipio antes de que el contribuyente pague. Solo la tienen
 * las declaraciones radicadas con la aprobación previa activa en su formulario.
 */
export type Approval =
  | { status: 'pending' }
  /** La observación y los documentos le llegan al contribuyente en el correo. */
  | {
      status: 'approved'
      date: string
      by: string
      observation?: string
      documents?: StoredFile[]
    }
  /** Solo se rechaza por una causal del art. 580: la declaración se tiene por no presentada. */
  | {
      status: 'rejected'
      date: string
      by: string
      ground: NotFiledGround
      observation?: string
      documents?: StoredFile[]
    }

/**
 * Causales del art. 580 del Estatuto Tributario por las que la declaración se tiene por no presentada, una por literal:
 * a) el lugar donde se presentó, b) la identificación del declarante, c) los datos para identificar las bases gravables y
 * d) las firmas del declarante y del contador o revisor fiscal.
 */
export type NotFiledGround = 'place' | 'identification' | 'taxable_bases' | 'signatures'

/** Lo que decide quien resuelve la aprobación previa; la fecha y quién la resolvió se ponen al guardarla. */
export type ApprovalResolution =
  { status: 'approved' } | { status: 'rejected'; ground: NotFiledGround }

/** Estado de la aprobación previa al día de hoy: vencido el plazo, queda vencida o se aprueba sola (lib/reglas). */
export type ApprovalStatus =
  'pending_approval' | 'overdue' | 'approved' | 'auto_approved' | 'rejected'

/**
 * Solicitud de corrección a la baja con el trámite del art. 589 del Estatuto Tributario anterior a la Ley 1819 de 2016,
 * que algunos estatutos municipales conservan: la corrección es un proyecto hasta que el municipio la acepta, y si no
 * responde en 6 meses, se acepta sola. Mientras tanto sigue vigente la declaración que corrige.
 */
export type CorrectionApplication =
  /** El motivo es lo que explica el contribuyente al radicarla. */
  | { status: 'pending'; reason: string }
  /** La observación le llega al contribuyente en el correo; al rechazar es obligatoria. */
  | {
      status: 'accepted' | 'rejected'
      reason: string
      date: string
      by: string
      observation?: string
    }

/** Estado de la solicitud de corrección al día de hoy: si pasan los 6 meses sin respuesta, se acepta por silencio (lib/reglas). */
export type CorrectionStatus = 'to_resolve' | 'accepted' | 'accepted_by_silence' | 'rejected'

/**
 * Emplazamiento que el municipio le notificó a un contribuyente. El acto lo expide el municipio en su sistema; el
 * dashboard registra el número y la fecha de notificación, para que el aplicativo liquide la sanción más alta a quien
 * declara o corrige después (arts. 642 y 644 del Estatuto Tributario). Da 1 mes desde la notificación.
 */
export type Summons = {
  id: string
  municipalityId: string
  /** Número del acto. */
  number: string
  notificationDate: string
  /** Copia del acto, opcional. */
  copy?: StoredFile
  /** Nombre de quien lo registró. */
  recordedBy: string
  recordDate: string
} &
  /** Para declarar (art. 715): va al inscrito y al periodo omiso, porque aún no hay declaración. */
  (
    | {
        kind: 'file'
        registrationId: string
        tax: Tax
        fiscalYear: number
        frequency: Frequency
        period: number
      }
    /** Para corregir (art. 685): va a la declaración vigente en la que el municipio tiene indicios de inexactitud. */
    | { kind: 'correct'; declarationId: string }
  )

/** Omit que respeta cada variante de una unión. */
type NoFields<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

/** Lo que se registra desde la pantalla; el id, quién y cuándo los pone el store. */
export type NewSummons = NoFields<Summons, 'id' | 'recordedBy' | 'recordDate'>

/** A quién va el emplazamiento, antes de ponerle el número del acto, la fecha de notificación y la copia. */
export type SummonsDestination = NoFields<NewSummons, 'number' | 'notificationDate' | 'copy'>

/**
 * Estado del emplazamiento al día de hoy (lib/emplazamientos). El de declarar está en plazo, vencido o declarado; el de
 * corregir, en plazo, sin respuesta o corregido.
 */
export type SummonsStatus = 'on_time' | 'overdue' | 'declared' | 'no_reply' | 'corrected'

export interface Payment {
  id: string
  declarationId: string
  date: string
  value: number
  method: string
  /** En los pagos en ventanilla: el número del recibo de caja y quién lo registró. */
  receipt?: string
  recordedBy?: string
}

export type CheckStatus = 'in_clearing' | 'paid' | 'returned'

/**
 * Cheque de gerencia recibido en la ventanilla. Es un pago salvo buen cobro: solo cuando el banco
 * lo paga en el canje se vuelve un Pago, con la fecha en que se recibió.
 */
export interface Check {
  id: string
  declarationId: string
  value: number
  /** Banco que expidió el cheque. */
  bank: string
  number: string
  /** Recibo de caja que se le entregó al contribuyente. */
  receipt: string
  receiptDate: string
  receivedBy: string
  status: CheckStatus
  resolutionDate?: string
  resolvedBy?: string
  returnReason?: string
}

// --- Configuración por municipio ---

export type Sector = 'industrial' | 'commercial' | 'services' | 'financial'

export interface Rate {
  ciiu: string
  description: string
  sector: Sector
  perThousand: number
}

/** Actividades y tarifas de un año gravable. Las carga el administrador del municipio con la plantilla de Excel. */
export interface FiscalYearActivities {
  municipalityId: string
  fiscalYear: number
  rates: Rate[]
  uploadedBy: string
  uploadDate: string
  /** Nombre del Excel del que salieron. */
  file: string
}

/** Rango de fechas de pago (inclusive) con su porcentaje de descuento. */
export interface EarlyPaymentTier {
  from: string
  to: string
  percentage: number
}

/** El ICA es anual; ReteICA y AutoReteICA pueden ser mensuales, bimestrales o trimestrales, cada una por su lado. */
export type Frequency = 'annual' | 'monthly' | 'bimonthly' | 'quarterly'

export interface PeriodDueDate {
  /** 1 es el primer periodo del año (el ICA anual tiene solo el 1). */
  period: number
  /**
   * Una sola fecha para todos o, si el calendario las separa por el último dígito del NIT o de la cédula,
   * diez: la posición es el dígito (la del 0 en la posición 0).
   */
  dates: string[]
}

/** Vencimientos de un formulario en un año gravable. */
export interface FormDueDates {
  frequency: Frequency
  /** La fecha cambia según el último dígito del NIT o de la cédula del contribuyente. */
  byDigit: boolean
  periods: PeriodDueDate[]
}

/**
 * Calendario de un año gravable, con los vencimientos de cada formulario por separado. El ICA anual
 * de ese año se presenta en vigencia + 1; ReteICA y AutoReteICA, durante el mismo año.
 */
export type FiscalYearCalendar = {
  fiscalYear: number
  /** Acto del municipio que fija el calendario. */
  decree?: string
  /**
   * Cuándo y quién lo guardó por primera vez. Las declaraciones del año presentadas antes quedan marcadas: se liquidaron
   * sin el calendario. Un año recién agregado no lo tiene hasta que se guarda.
   */
  uploaded?: CalendarUpload
} & Record<Tax, FormDueDates>

export interface CalendarUpload {
  date: string
  /** Nombre de quien lo guardó, como era en ese momento. */
  by: string
}

export interface MunicipalityConfig {
  municipalityId: string
  zeroDeclaration: boolean
  /**
   * Se reciben declaraciones de un año gravable cuyo calendario no se ha cargado (el dashboard las marca). Si está
   * apagado, el formulario no deja presentarlas hasta que el municipio cargue el calendario.
   */
  allowFilingWithoutCalendar: boolean
  /**
   * La ReteICA o AutoReteICA presentada a tiempo sin el pago total no queda ineficaz si se paga completa dentro de los
   * 2 meses siguientes al vencimiento (art. 580-1 del Estatuto Tributario).
   */
  withholdingPaymentInTwoMonths: boolean
  automaticRitCancellation: boolean
  /** Los funcionarios no ven en Inicio lo que ha recaudado el municipio. */
  hideCollectionFromOfficials: boolean
  /**
   * Cómo se corrige a la baja: con la corrección directa del art. 589 vigente o, si el estatuto del municipio lo
   * conserva, con la solicitud y el proyecto de corrección del art. 589 anterior. Aplica a lo que se radique desde que
   * se cambia.
   */
  downwardCorrection: 'project_589' | 'direct_correction'
  /** El concejo fija los tramos para cada año gravable; fuera de ellos no hay descuento. */
  earlyPayment: {
    isActive: boolean
    byFiscalYear: { fiscalYear: number; tiers: EarlyPaymentTier[] }[]
  }
  /** Calendario tributario de vencimientos por año gravable, también de años pasados. */
  taxCalendar: { byFiscalYear: FiscalYearCalendar[] }
  advancePercentage: number
  fireSurcharge: { active: boolean; percentage: number }
  reteica: {
    modality: 'flat' | 'activity' | 'concept'
    flatRatePerThousand: number
    minServiceBaseUvt: number
    minPurchaseBaseUvt: number
  }
  selfWithholding: { modality: 'full' | 'percentage'; percentage: number }
  penalties: {
    lateFiling: number
    summonsLateFiling: number
    correction: number
    summonsCorrection: number
    minimumUvt: number
  }
  registrationTermMonths: number
  /** Aplica a los formularios con la aprobación previa activa. */
  priorApproval: {
    /** Días hábiles desde la radicación para aprobar o rechazar. */
    termBusinessDays: number
    /** Si se vence el plazo sin revisión: se aprueba sola o solo se alerta. */
    onDue: 'approve' | 'warn'
    /** Días hábiles que vale el recibo de pago desde la aprobación. */
    receiptValidityBusinessDays: number
  }
  /** Formularios que el municipio desactivó para los contribuyentes, con su motivo. Solo cuentan los que tiene activos 1cero1. */
  disabledForms: Partial<Record<Form, DisabledForm>>
  /** Se reciben cheques de gerencia por menos del saldo pendiente; si no, el cheque debe cubrirlo completo. */
  partialCheck: boolean
}

/** El RIT o el formulario de uno de los impuestos. */
export type Form = Tax | 'rit'

export interface DisabledForm {
  reason: string
  date: string
  /** Nombre de quien lo desactivó. */
  by: string
}

/** Recaudo consolidado de un mes de años anteriores: la demo solo trae pagos uno a uno del año en curso. */
export interface MonthlyCollection {
  municipalityId: string
  year: number
  /** 1 a 12. */
  month: number
  values: Record<Tax, number>
}

// --- Bitácora ---

/**
 * Una petición a la API que cambió algo, como la guarda el back al terminar cada endpoint: quién y cuándo, el
 * controlador, la acción, el endpoint, los datos enviados y si salió bien. No trae el valor anterior: para eso el back
 * tendría que consultarlo en cada petición. Solo la ve 1cero1.
 */
export interface AuditLogEntry {
  /** Consecutivo: el registro más reciente tiene el número más alto, así que ordena aunque dos tengan la misma hora. */
  id: number
  /** Fecha y hora local de la petición, AAAA-MM-DDTHH:MM. */
  dateTime: string
  /** Quién la hizo, como era en ese momento: el usuario puede cambiar o eliminarse después. */
  user: { id: string; name: string; role: Role }
  /** Municipio de lo que se cambió; null en lo que no es de un municipio, como el inicio de sesión de 1cero1. */
  municipalityId: string | null
  /** Nombres tal como vienen del back: "Pagos", "RegistrarPagoVentanilla", "POST /api/pagos/ventanilla". */
  controller: string
  action: string
  endpoint: string
  /** Lo que se envió en el cuerpo o en la URL, tal como llegó. */
  data: Record<string, unknown>
  /** Si la petición salió bien: el back registra también las que fallan. */
  success: boolean
}

export interface Data {
  municipalities: Municipality[]
  users: User[]
  registrations: Registration[]
  declarations: Declaration[]
  payments: Payment[]
  checks: Check[]
  collectionHistory: MonthlyCollection[]
  settingsList: MunicipalityConfig[]
  activities: FiscalYearActivities[]
  summonses: Summons[]
  /** Datos de prueba, más lo que se hace en el navegador. */
  auditLog: AuditLogEntry[]
}
