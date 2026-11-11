import { emplazamientoDelOmiso, situacionEmplazamiento } from '../../../../lib/emplazamientos'
import {
  etiquetaEstadoEmplazamiento,
  etiquetaEstadoInscripcion,
  etiquetaImpuesto,
  etiquetaPeriodo,
  formatoDocumento,
  formatoFecha,
  normalizar,
  textoEnProduccion,
} from '../../../../lib/formato'
import { idOmiso } from '../../../../lib/omisos'
import type {
  Declaracion,
  Emplazamiento,
  EstadoEmplazamiento,
  Municipio,
  Omiso,
  ResultadoOmisos,
} from '../../../../types'
import { diferenciaDias } from '../../../../utils'
import type { Destinatario } from '../ModalEmplazamiento'

/** Opciones del filtro de año gravable: los años que tienen omisos, del más reciente al más antiguo. */
export function opcionesAnio(omisos: Omiso[]) {
  const anios = [...new Set(omisos.map((o) => o.vigencia))].sort((a, b) => b - a)
  return Object.fromEntries([
    ['', 'Todo año gravable'],
    ...anios.map((v) => [String(v), `Año gravable ${v}`]),
  ]) as Record<string, string>
}

/** Omisos que coinciden con el texto (nombre, documento o número de RIT) y con el año gravable elegido. */
export function filtrarOmisos(omisos: Omiso[], texto: string, anio: string) {
  const busqueda = normalizar(texto)
  return omisos.filter(
    ({ inscripcion: i, vigencia }) =>
      (!anio || String(vigencia) === anio) &&
      (!busqueda ||
        normalizar(i.nombre).includes(busqueda) ||
        i.documento.includes(busqueda) ||
        i.numeroRit.includes(busqueda)),
  )
}

/** Desde cuándo se revisa: lo anterior a la salida a producción de cada formulario está en otro sistema. */
export function textoDesde(municipio: Municipio | undefined) {
  if (!municipio)
    return 'Se revisan los vencimientos desde que los formularios de cada municipio salieron a producción en el aplicativo. Lo anterior está en otro sistema.'
  const desde = textoEnProduccion(municipio)
  return desde
    ? `Se revisan los vencimientos desde ${desde}, cuando los formularios de ${municipio.nombre} salieron a producción en el aplicativo. Lo anterior está en otro sistema.`
    : `${municipio.nombre} no tiene formularios activos en el aplicativo, así que no hay vencimientos que revisar.`
}

/** Años sin calendario: sus omisos no se pueden revisar. Con todos los municipios, dice de cuál es cada año. */
export function textoSinCalendario(
  lista: ResultadoOmisos['sinCalendario'],
  nombres: Map<string, string>,
  todos: boolean,
) {
  const anios = lista
    .map((x) => (todos ? `${nombres.get(x.municipioId)} ${x.vigencia}` : String(x.vigencia)))
    .join(', ')
  return lista.length === 1
    ? `No hay calendario del año gravable ${anios}: sus omisos no se pueden revisar hasta cargarlo en Calendario.`
    : `No hay calendario de los años gravables ${anios}: sus omisos no se pueden revisar hasta cargarlos en Calendario.`
}

/** Agentes de ReteICA sin declarar en municipios que no exigen la declaración en ceros. */
export const textoSinCeros = (agentes: number) =>
  `${agentes === 1 ? 'Un agente de ReteICA no presentó' : `${agentes} agentes de ReteICA no presentaron`} alguna declaración y no se ${agentes === 1 ? 'marca como omiso' : 'marcan como omisos'}: el municipio no exige la declaración en ceros, así que pudieron no haber retenido nada en ese periodo.`

/** Si el omiso tiene emplazamiento y en qué va; mientras sea omiso, solo puede estar en plazo o vencido. */
export function estadoEmplazamientoDe(
  o: Omiso,
  emplazamientos: Emplazamiento[],
  declaraciones: Declaracion[],
  hoy: string,
) {
  const e = emplazamientoDelOmiso(o, emplazamientos)
  return e ? situacionEmplazamiento(e, declaraciones, hoy).estado : 'sin_emplazamiento'
}

/** El omiso como destinatario de un emplazamiento para declarar. */
export const destinatarioDe = (o: Omiso): Destinatario => ({
  clave: idOmiso(o),
  titulo: o.inscripcion.nombre,
  descripcion: `${etiquetaImpuesto[o.impuesto]} · ${etiquetaPeriodo(o)} · venció el ${formatoFecha(o.vencimiento)}`,
  desde: o.vencimiento,
  destino: {
    tipo: 'declarar',
    municipioId: o.inscripcion.municipioId,
    inscripcionId: o.inscripcion.id,
    impuesto: o.impuesto,
    vigencia: o.vigencia,
    periodicidad: o.periodicidad,
    periodo: o.periodo,
  },
})

/** Una fila del Excel, en el orden de COLUMNAS_EXCEL. */
export function filaExcel(
  o: Omiso,
  nombres: Map<string, string>,
  hoy: string,
  emplazamiento?: { e: Emplazamiento; estado: EstadoEmplazamiento },
): (string | number)[] {
  const i = o.inscripcion
  return [
    nombres.get(i.municipioId) ?? '',
    i.numeroRit,
    i.nombre,
    formatoDocumento(i),
    etiquetaEstadoInscripcion[i.estado],
    etiquetaImpuesto[o.impuesto],
    etiquetaPeriodo(o),
    o.vencimiento,
    diferenciaDias(o.vencimiento, hoy),
    emplazamiento?.e.numero ?? '',
    emplazamiento?.e.fechaNotificacion ?? '',
    emplazamiento ? etiquetaEstadoEmplazamiento[emplazamiento.estado] : 'Sin emplazamiento',
    i.telefono,
    i.correo,
    i.direccion,
  ]
}
