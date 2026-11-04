import { etiquetaPeriodoCalendario } from '../../../../lib/calendario'
import { etiquetaEstadoInscripcion, etiquetaImpuesto, formatoDocumento, formatoFecha, normalizar } from '../../../../lib/formato'
import type { Municipio, Omiso, ResultadoOmisos } from '../../../../types'
import { diferenciaDias } from '../../../../utils'

/** Opciones del filtro de año gravable: los años que tienen omisos, del más reciente al más antiguo. */
export function opcionesAnio(omisos: Omiso[]) {
  const anios = [...new Set(omisos.map((o) => o.vigencia))].sort((a, b) => b - a)
  return Object.fromEntries([['', 'Todo año gravable'], ...anios.map((v) => [String(v), `Año gravable ${v}`])]) as Record<string, string>
}

/** Omisos que coinciden con el texto (nombre, documento o número de RIT) y con el año gravable elegido. */
export function filtrarOmisos(omisos: Omiso[], texto: string, anio: string) {
  const busqueda = normalizar(texto)
  return omisos.filter(
    ({ inscripcion: i, vigencia }) =>
      (!anio || String(vigencia) === anio) &&
      (!busqueda || normalizar(i.nombre).includes(busqueda) || i.documento.includes(busqueda) || i.numeroRit.includes(busqueda)),
  )
}

/** Desde cuándo se revisa: lo anterior a que el municipio recibiera declaraciones en el aplicativo está en otro sistema. */
export const textoDesde = (municipio: Municipio | undefined) =>
  municipio
    ? `Se revisan los vencimientos desde el ${formatoFecha(municipio.declaracionesDesde)}, cuando ${municipio.nombre} empezó a recibir declaraciones en el aplicativo. Lo anterior está en otro sistema.`
    : 'Se revisan los vencimientos desde que cada municipio empezó a recibir declaraciones en el aplicativo. Lo anterior está en otro sistema.'

/** Años sin calendario: sus omisos no se pueden revisar. Con todos los municipios, dice de cuál es cada año. */
export function textoSinCalendario(lista: ResultadoOmisos['sinCalendario'], nombres: Map<string, string>, todos: boolean) {
  const anios = lista.map((x) => (todos ? `${nombres.get(x.municipioId)} ${x.vigencia}` : String(x.vigencia))).join(', ')
  return lista.length === 1
    ? `No hay calendario del año gravable ${anios}: sus omisos no se pueden revisar hasta cargarlo en Calendario.`
    : `No hay calendario de los años gravables ${anios}: sus omisos no se pueden revisar hasta cargarlos en Calendario.`
}

/** Agentes de ReteICA sin declarar en municipios que no exigen la declaración en ceros. */
export const textoSinCeros = (agentes: number) =>
  `${agentes === 1 ? 'Un agente de ReteICA no presentó' : `${agentes} agentes de ReteICA no presentaron`} alguna declaración y no se ${agentes === 1 ? 'marca como omiso' : 'marcan como omisos'}: el municipio no exige la declaración en ceros, así que pudieron no haber retenido nada en ese periodo.`

/** Una fila del Excel, en el orden de COLUMNAS_EXCEL. */
export function filaExcel(o: Omiso, nombres: Map<string, string>, hoy: string): (string | number)[] {
  const i = o.inscripcion
  return [
    nombres.get(i.municipioId) ?? '',
    i.numeroRit,
    i.nombre,
    formatoDocumento(i),
    etiquetaEstadoInscripcion[i.estado],
    etiquetaImpuesto[o.impuesto],
    etiquetaPeriodoCalendario(o.impuesto, o.periodicidad, o.vigencia, o.periodo),
    o.vencimiento,
    diferenciaDias(o.vencimiento, hoy),
    i.telefono,
    i.correo,
    i.direccion,
  ]
}
