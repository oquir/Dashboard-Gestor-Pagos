import { NOMBRES_PERIODOS } from '../constants'
import type {
  Calidad,
  Emplazamiento,
  EstadoAprobacion,
  EstadoCheque,
  EstadoCorreccion,
  EstadoEmplazamiento,
  EstadoInscripcion,
  EstadoNovedad,
  EstadoPago,
  FirmanteContable,
  Formulario,
  FormularioDesactivado,
  Impuesto,
  Inscripcion,
  Municipio,
  Periodicidad,
  Rol,
  Sector,
  TipoDeclaracion,
  TipoNovedad,
  TipoPersona,
  Usuario,
} from '../types'

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})
const compacto = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 })
const fecha = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
const horaMinutos = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })
const lista = new Intl.ListFormat('es-CO', { type: 'conjunction' })

export const formatoPesos = (valor: number) => pesos.format(valor)
export const formatoCompacto = (valor: number) => compacto.format(valor)
export const formatoFecha = (iso: string) => fecha.format(new Date(`${iso}T12:00:00`))
/** Hora de un registro AAAA-MM-DDTHH:MM, como "1:12 a. m.". */
export const formatoHora = (fechaHora: string) => horaMinutos.format(new Date(`${fechaHora}:00`))
/** "A", "A y B", "A, B y C". */
export const formatoLista = (textos: string[]) => lista.format(textos)
/** "hace 1 día", "hace 12 días". */
export const formatoHaceDias = (dias: number) => (dias === 1 ? 'hace 1 día' : `hace ${dias} días`)
/** Cuánto le queda al plazo para consignar la retención: "Faltan 14 días", "Vence hoy", "Venció hace 3 días". */
export const plazoConsignacion = (dias: number) =>
  dias < 0
    ? `Venció ${formatoHaceDias(-dias)}`
    : dias === 0
      ? 'Vence hoy'
      : dias === 1
        ? 'Falta 1 día'
        : `Faltan ${dias} días`
/** Para comparar textos sin importar tildes, mayúsculas ni espacios de los extremos. */
export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase()

/** Meses abreviados, para las gráficas. */
export const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

export const etiquetaRol: Record<Rol, string> = {
  '1cero1': '1cero1',
  admin_municipio: 'Administrador municipio',
  funcionario: 'Funcionario municipio',
}

export const nombreCompleto = (u: Pick<Usuario, 'nombres' | 'apellidos'>) =>
  `${u.nombres} ${u.apellidos}`

/** Cuándo, quién y por qué el municipio desactivó un formulario. */
export const textoDesactivado = (d: FormularioDesactivado) =>
  `Desactivado por el municipio el ${formatoFecha(d.fecha)} (${d.por}): ${d.motivo}`

/** Número de documento, con el dígito de verificación si lo tiene. */
export const numeroDocumento = (d: Pick<Inscripcion, 'documento' | 'dv'>) =>
  `${d.documento}${d.dv ? `-${d.dv}` : ''}`

/** Tipo y número de documento, con el dígito de verificación si lo tiene. */
export const formatoDocumento = (d: Pick<Inscripcion, 'tipoDocumento' | 'documento' | 'dv'>) =>
  `${d.tipoDocumento} ${numeroDocumento(d)}`

export const etiquetaTipoDocumento: Record<Inscripcion['tipoDocumento'], string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  NIT: 'NIT',
}

export const etiquetaTipoPersona: Record<TipoPersona, string> = {
  natural: 'Persona natural',
  juridica: 'Persona jurídica',
  consorcio: 'Consorcio',
  union_temporal: 'Unión temporal',
  patrimonio_autonomo: 'Patrimonio autónomo',
}

export const etiquetaCargoContable: Record<FirmanteContable['cargo'], string> = {
  contador: 'Contador',
  revisor_fiscal: 'Revisor fiscal',
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

/** El tipo de la declaración; la corrección que baja el valor a pagar se llama "Corrección a la baja". */
export const textoTipoDeclaracion = (tipo: TipoDeclaracion, aLaBaja: boolean) =>
  aLaBaja ? 'Corrección a la baja' : etiquetaTipoDeclaracion[tipo]

export const etiquetaEstadoAprobacion: Record<EstadoAprobacion, string> = {
  por_aprobar: 'Por aprobar',
  vencida: 'Aprobación vencida',
  aprobada: 'Aprobada',
  aprobada_automatica: 'Aprobada automáticamente',
  rechazada: 'Rechazada',
}

export const etiquetaEstadoCorreccion: Record<EstadoCorreccion, string> = {
  por_resolver: 'Por resolver',
  aceptada: 'Aceptada',
  aceptada_por_silencio: 'Aceptada por silencio',
  rechazada: 'Rechazada',
}

export const etiquetaTipoEmplazamiento: Record<Emplazamiento['tipo'], string> = {
  declarar: 'Emplazamiento para declarar',
  corregir: 'Emplazamiento para corregir',
}

export const etiquetaEstadoEmplazamiento: Record<EstadoEmplazamiento, string> = {
  en_plazo: 'En plazo',
  vencido: 'Plazo vencido',
  declarado: 'Declarado',
  sin_respuesta: 'Sin respuesta',
  corregido: 'Corregido',
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

export const etiquetaPeriodicidad: Record<Periodicidad, string> = {
  anual: 'Anual',
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
}

/**
 * Nombre del periodo, el mismo en declaraciones, omisos y vencimientos: el año gravable en el ICA anual; en ReteICA y
 * AutoReteICA, el mes, el bimestre o el trimestre con sus meses y su año, como "Bimestre 3 (may – jun) de 2026".
 */
export const etiquetaPeriodo = ({
  impuesto,
  periodicidad,
  vigencia,
  periodo,
}: {
  impuesto: Impuesto
  periodicidad: Periodicidad
  vigencia: number
  periodo: number
}) =>
  impuesto === 'ica'
    ? `Año gravable ${vigencia}`
    : `${NOMBRES_PERIODOS[periodicidad][periodo - 1]} de ${vigencia}`

/** La fecha de salida a producción de un formulario, de solo lectura; sin fecha, el formulario nunca se ha activado. */
export const textoSalidaProduccion = (fecha: string | undefined) =>
  fecha ? `En producción desde el ${formatoFecha(fecha)}` : 'Nunca se ha activado'

/**
 * Desde cuándo recibe el aplicativo los impuestos activos del municipio: "el 1 feb 2026" si todos salieron el mismo día,
 * o "el 1 feb 2026 (ICA) y el 1 mar 2026 (ReteICA)" si no. Es null si el municipio no tiene ningún impuesto activo.
 */
export function textoEnProduccion(m: Municipio) {
  const porFecha = new Map<string, string[]>()
  for (const i of Object.keys(etiquetaImpuesto) as Impuesto[]) {
    const fecha = m.impuestos[i] && m.enProduccionDesde[i]
    if (fecha) porFecha.set(fecha, [...(porFecha.get(fecha) ?? []), etiquetaImpuesto[i]])
  }
  const grupos = [...porFecha].sort(([a], [b]) => a.localeCompare(b))
  if (grupos.length === 0) return null
  if (grupos.length === 1) return `el ${formatoFecha(grupos[0][0])}`
  return formatoLista(
    grupos.map(([f, nombres]) => `el ${formatoFecha(f)} (${formatoLista(nombres)})`),
  )
}
