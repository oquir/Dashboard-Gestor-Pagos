import type {
  Calidad,
  EstadoAprobacion,
  EstadoCheque,
  EstadoInscripcion,
  EstadoNovedad,
  EstadoPago,
  Formulario,
  FormularioDesactivado,
  Impuesto,
  Inscripcion,
  Rol,
  Sector,
  TipoDeclaracion,
  TipoNovedad,
  TipoPersona,
  Usuario,
} from '../types'

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const compacto = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 })
const fecha = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

export const formatoPesos = (valor: number) => pesos.format(valor)
export const formatoCompacto = (valor: number) => compacto.format(valor)
export const formatoFecha = (iso: string) => fecha.format(new Date(`${iso}T12:00:00`))
/** Para comparar textos sin importar tildes, mayúsculas ni espacios de los extremos. */
export const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()

/** Meses abreviados, para las gráficas. */
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const etiquetaRol: Record<Rol, string> = {
  '1cero1': '1cero1',
  admin_municipio: 'Administrador municipio',
  funcionario: 'Funcionario municipio',
}

export const nombreCompleto = (u: Pick<Usuario, 'nombres' | 'apellidos'>) => `${u.nombres} ${u.apellidos}`

/** Cuándo, quién y por qué el municipio desactivó un formulario. */
export const textoDesactivado = (d: FormularioDesactivado) => `Desactivado por el municipio el ${formatoFecha(d.fecha)} (${d.por}): ${d.motivo}`

/** Tipo y número de documento, con el dígito de verificación si lo tiene. */
export const formatoDocumento = (d: Pick<Inscripcion, 'tipoDocumento' | 'documento' | 'dv'>) => `${d.tipoDocumento} ${d.documento}${d.dv ? `-${d.dv}` : ''}`

export const etiquetaTipoPersona: Record<TipoPersona, string> = {
  natural: 'Persona natural',
  juridica: 'Persona jurídica',
  consorcio: 'Consorcio',
  union_temporal: 'Unión temporal',
  patrimonio_autonomo: 'Patrimonio autónomo',
}

export const etiquetaCalidad: Record<Calidad, string> = {
  contribuyente: 'Contribuyente',
  agente_retenedor: 'Agente retenedor',
  autorretenedor: 'Autorretenedor',
}

export const etiquetaEstadoInscripcion: Record<EstadoInscripcion, string> = {
  en_revision: 'En revisión',
  activa: 'Activa',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
}

export const etiquetaTipoNovedad: Record<TipoNovedad, string> = {
  inscripcion: 'Inscripción',
  actualizacion: 'Actualización',
  cancelacion: 'Cancelación',
}

export const etiquetaEstadoNovedad: Record<EstadoNovedad, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

export const etiquetaSector: Record<Sector, string> = {
  industrial: 'Industrial',
  comercial: 'Comercial',
  servicios: 'Servicios',
  financiero: 'Financiero',
}

export const etiquetaImpuesto: Record<Impuesto, string> = {
  ica: 'ICA anual',
  reteica: 'ReteICA',
  autorretencion: 'AutoReteICA',
}

export const etiquetaFormulario: Record<Formulario, string> = { rit: 'RIT', ...etiquetaImpuesto }

export const etiquetaTipoDeclaracion: Record<TipoDeclaracion, string> = {
  inicial: 'Inicial',
  correccion: 'Corrección',
  clausura: 'Clausura',
}

export const etiquetaEstadoAprobacion: Record<EstadoAprobacion, string> = {
  por_aprobar: 'Por aprobar',
  vencida: 'Aprobación vencida',
  aprobada: 'Aprobada',
  aprobada_automatica: 'Aprobada automáticamente',
  rechazada: 'Rechazada',
}

export const etiquetaEstadoPago: Record<EstadoPago, string> = {
  pagada: 'Pagada',
  parcial: 'Pago parcial',
  sin_pago: 'Sin pago',
  saldo_a_favor: 'Saldo a favor',
  ineficaz: 'Ineficaz (sin pago total)',
}

export const etiquetaEstadoCheque: Record<EstadoCheque, string> = {
  en_canje: 'En canje',
  pagado: 'Pagado',
  devuelto: 'Devuelto',
}

export function etiquetaPeriodo(impuesto: Impuesto, vigencia: number, periodo: number) {
  return impuesto === 'ica' ? `Año gravable ${vigencia}` : `${vigencia} · bimestre ${periodo}`
}
