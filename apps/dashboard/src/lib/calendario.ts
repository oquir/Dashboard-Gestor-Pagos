// Calendario tributario: vencimientos por año gravable y formulario, con fecha única o por último dígito del NIT o la cédula.
import { DIGITOS, MESES_POR_PERIODO, NOMBRES_PERIODOS } from '../constants'
import type {
  CalendarioVigencia,
  ConfigMunicipio,
  Declaracion,
  Impuesto,
  Municipio,
  Periodicidad,
  VencimientoPeriodo,
  VencimientosFormulario,
} from '../types'
import { moverAnios } from '../utils'

/** Periodos del año sin fechas: una por periodo o, por dígito, diez. */
export const periodosVacios = (
  periodicidad: Periodicidad,
  porDigito: boolean,
): VencimientoPeriodo[] =>
  NOMBRES_PERIODOS[periodicidad].map((_, i) => ({
    periodo: i + 1,
    fechas: Array<string>(porDigito ? 10 : 1).fill(''),
  }))

const formularioVacio = (periodicidad: Periodicidad): VencimientosFormulario => ({
  periodicidad,
  porDigito: false,
  periodos: periodosVacios(periodicidad, false),
})

/**
 * Calendario de un año gravable nuevo, pasado o futuro. Si hay un año de base, copia su forma (periodicidad y
 * fechas por dígito) y sus fechas corridas a ese año, para que el administrador solo cambie lo que difiere del
 * calendario oficial. El acto no se copia: es otro. Sin base, arranca vacío, sin fechas inventadas.
 */
export function calendarioNuevo(vigencia: number, base?: CalendarioVigencia): CalendarioVigencia {
  if (!base)
    return {
      vigencia,
      ica: formularioVacio('anual'),
      reteica: formularioVacio('bimestral'),
      autorretencion: formularioVacio('bimestral'),
    }
  const anios = vigencia - base.vigencia
  const correr = (f: VencimientosFormulario): VencimientosFormulario => ({
    ...f,
    periodos: f.periodos.map((p) => ({
      ...p,
      fechas: p.fechas.map((fecha) => moverAnios(fecha, anios)),
    })),
  })
  return {
    vigencia,
    ica: correr(base.ica),
    reteica: correr(base.reteica),
    autorretencion: correr(base.autorretencion),
  }
}

/** Otra periodicidad cambia qué es cada periodo, así que las fechas quedan vacías para ponerlas de nuevo. */
export const conPeriodicidad = (
  f: VencimientosFormulario,
  periodicidad: Periodicidad,
): VencimientosFormulario => ({
  ...f,
  periodicidad,
  periodos: periodosVacios(periodicidad, f.porDigito),
})

/** Al separar por dígito, cada dígito arranca con la fecha única; al unir, queda la del primer dígito que tenga fecha. */
export const conPorDigito = (
  f: VencimientosFormulario,
  porDigito: boolean,
): VencimientosFormulario => ({
  ...f,
  porDigito,
  periodos: f.periodos.map((p) => ({
    ...p,
    fechas: porDigito
      ? Array<string>(10).fill(p.fechas[0] ?? '')
      : [DIGITOS.map((d) => p.fechas[d]).find(Boolean) ?? ''],
  })),
})

/** Cambia una fecha: `posicion` es el dígito, o 0 si la fecha es la misma para todos. */
export const conFecha = (
  f: VencimientosFormulario,
  periodo: number,
  posicion: number,
  fecha: string,
): VencimientosFormulario => ({
  ...f,
  periodos: f.periodos.map((p) =>
    p.periodo === periodo
      ? { ...p, fechas: p.fechas.map((actual, i) => (i === posicion ? fecha : actual)) }
      : p,
  ),
})

/** Primer y último día del periodo dentro del año gravable. */
export function rangoPeriodo(periodicidad: Periodicidad, vigencia: number, periodo: number) {
  const meses = MESES_POR_PERIODO[periodicidad]
  const inicio = `${vigencia}-${String((periodo - 1) * meses + 1).padStart(2, '0')}-01`
  // El día 0 del mes siguiente es el último del mes en que termina el periodo.
  const fin = new Date(Date.UTC(vigencia, periodo * meses, 0)).toISOString().slice(0, 10)
  return { inicio, fin }
}

/**
 * Vencimiento del periodo para un contribuyente: la fecha única o la de su último dígito. El documento se guarda sin el
 * dígito de verificación, así que su último carácter es el dígito que cuenta. Sin fecha, undefined.
 */
export const vencimientoPara = (
  f: VencimientosFormulario,
  p: VencimientoPeriodo,
  documento: string,
) => (f.porDigito ? p.fechas[Number(documento.trim().slice(-1))] : p.fechas[0]) || undefined

/** Primera y última fecha del periodo; con fecha única, las dos son la misma. Sin fechas, undefined. */
export function rangoFechas(f: VencimientosFormulario, p: VencimientoPeriodo) {
  const fechas = p.fechas
    .slice(0, f.porDigito ? 10 : 1)
    .filter(Boolean)
    .sort()
  return fechas.length > 0 ? { desde: fechas[0], hasta: fechas[fechas.length - 1] } : undefined
}

/**
 * Periodos con fechas sin poner en los formularios que el municipio tiene activos. Clave:
 * `calendario-<año>-<impuesto>-<periodo>`.
 */
export function erroresVencimientos(cal: CalendarioVigencia, impuestos: Record<Impuesto, boolean>) {
  const errores: Record<string, string> = {}
  for (const impuesto of (Object.keys(impuestos) as Impuesto[]).filter((i) => impuestos[i])) {
    const f = cal[impuesto]
    const cuantas = f.porDigito ? 10 : 1
    for (const p of f.periodos) {
      if (p.fechas.slice(0, cuantas).filter(Boolean).length < cuantas) {
        errores[`calendario-${cal.vigencia}-${impuesto}-${p.periodo}`] = f.porDigito
          ? 'Pon la fecha de los diez dígitos.'
          : 'Pon la fecha.'
      }
    }
  }
  return errores
}

// --- Calendario cargado (docs/Pendientes-y-decisiones.md, §3.14) ---

/** Cuándo y quién cargó el calendario del año gravable en el municipio; undefined si no lo ha cargado. */
export const cargaCalendario = (cfg: ConfigMunicipio | undefined, vigencia: number) =>
  cfg?.calendarioTributario.porVigencia.find((c) => c.vigencia === vigencia)?.cargado

/**
 * La declaración se presentó sin el calendario de su año gravable: el municipio no lo había cargado o lo cargó
 * después. Su vencimiento, su sanción y sus intereses pueden estar mal calculados.
 */
export function presentadaSinCalendario(d: Declaracion, cfg: ConfigMunicipio | undefined) {
  const carga = cargaCalendario(cfg, d.vigencia)
  return !carga || d.fechaPresentacion < carga.fecha
}

/**
 * Municipios activos (todos, o solo el elegido) que no han cargado el calendario del año en curso. Se avisa desde el
 * 1 de enero, cuando empiezan a correr los periodos de ReteICA y AutoReteICA del año. Al que no tiene ningún impuesto
 * activo no se le pide: no hay vencimientos que poner.
 */
export const municipiosSinCalendario = (
  municipios: Municipio[],
  configuraciones: ConfigMunicipio[],
  municipioId: string | null,
  anio: number,
) =>
  municipios.filter(
    (m) =>
      m.activo &&
      (municipioId === null || m.id === municipioId) &&
      Object.values(m.impuestos).some(Boolean) &&
      !cargaCalendario(
        configuraciones.find((c) => c.municipioId === m.id),
        anio,
      ),
  )

/** Al guardar, los años recién agregados quedan cargados hoy por quien guarda; los que ya estaban conservan su fecha. */
export const conCargas = (
  calendarios: CalendarioVigencia[],
  por: string,
  fecha: string,
): CalendarioVigencia[] =>
  calendarios.map((c) => (c.cargado ? c : { ...c, cargado: { fecha, por } }))
