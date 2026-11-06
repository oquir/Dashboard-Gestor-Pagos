// Omisos: inscritos en el RIT que debían declarar un periodo ya vencido y no lo hicieron (docs/Pendientes-y-decisiones.md, §3.5).
import type { Calidad, ConfigMunicipio, Declaracion, Impuesto, Inscripcion, Municipio, Omiso, ResultadoOmisos } from '../types'
import { rangoPeriodo, vencimientoPara } from './calendario'

/** La calidad del RIT que obliga a presentar cada formulario. */
const CALIDAD_DEL_IMPUESTO: Record<Impuesto, Calidad> = { ica: 'contribuyente', reteica: 'agente_retenedor', autorretencion: 'autorretenedor' }
const IMPUESTOS = Object.keys(CALIDAD_DEL_IMPUESTO) as Impuesto[]

/** Fecha de cese de una inscripción cancelada; undefined si no está cancelada. */
function fechaCese(ins: Inscripcion) {
  if (ins.estado !== 'cancelada') return undefined
  const cancelacion = ins.novedades.findLast((n) => n.tipo === 'cancelacion' && n.estado === 'aprobada')
  return cancelacion?.cancelacion?.fechaCese ?? cancelacion?.fecha
}

/** Identifica un omiso: el inscrito, el formulario y el periodo. */
export const idOmiso = (o: Omiso) => `${o.inscripcion.id}-${o.impuesto}-${o.vigencia}-${o.periodo}`

interface Fuente {
  municipios: Municipio[]
  configuraciones: ConfigMunicipio[]
  inscripciones: Inscripcion[]
  declaraciones: Declaracion[]
}

/**
 * Cruza los inscritos con las declaraciones, periodo por periodo del calendario, en los municipios que tienen el RIT en
 * el aplicativo (todos, o solo el elegido). Un inscrito es omiso de un periodo cuando:
 * - su inscripción está activa o cancelada, y tiene la calidad que obliga a presentar ese formulario desde antes de
 *   que termine el periodo (el SIMPLE no declara ICA ni AutoReteICA en el municipio);
 * - si la canceló, cesó después de que empezó el periodo;
 * - su vencimiento (por último dígito, si el calendario los separa) ya pasó, es desde que el municipio recibe
 *   declaraciones en el aplicativo y el municipio no tenía desactivado el formulario;
 * - no presentó ninguna declaración que cubra fechas del periodo. Se compara por fechas y no por el número del periodo,
 *   porque cada declaración conserva la periodicidad con que se presentó: si después el municipio la cambia en el
 *   calendario, lo presentado sigue contando. La rechazada en la aprobación previa se tiene por no presentada (art. 580
 *   ET); la ineficaz cuenta como presentada.
 * La ReteICA de un municipio que no exige la declaración en ceros no se marca: el agente pudo no retener nada.
 */
export function calcularOmisos({ municipios, configuraciones, inscripciones, declaraciones }: Fuente, municipioId: string | null, hoy: string): ResultadoOmisos {
  const omisos: Omiso[] = []
  const agentesSinCeros = new Set<string>()
  const sinCalendario: ResultadoOmisos['sinCalendario'] = []
  // Los omisos salen del RIT: solo cuentan las declaraciones de los inscritos. Por inscrito, formulario y año, las
  // fechas que cubre cada una.
  const presentadas = new Map<string, { inicio: string; fin: string }[]>()
  for (const d of declaraciones) {
    if (!d.inscripcionId || d.aprobacion?.estado === 'rechazada') continue
    const clave = `${d.inscripcionId}|${d.impuesto}|${d.vigencia}`
    presentadas.set(clave, [...(presentadas.get(clave) ?? []), rangoPeriodo(d.periodicidad, d.vigencia, d.periodo)])
  }
  const cubierto = (clave: string, inicio: string, fin: string) => presentadas.get(clave)?.some((r) => r.inicio <= fin && inicio <= r.fin) ?? false

  for (const m of municipios) {
    if (!m.rit || (municipioId !== null && m.id !== municipioId)) continue
    const cfg = configuraciones.find((c) => c.municipioId === m.id)
    if (!cfg) continue
    const calendarios = cfg.calendarioTributario.porVigencia
    const inscritos = inscripciones.filter((i) => i.municipioId === m.id && (i.estado === 'activa' || i.estado === 'cancelada'))

    // Desde el año anterior al de la primera salida a producción, porque su ICA anual vence en el año siguiente, hasta el año en curso.
    const desde = IMPUESTOS.filter((i) => m.impuestos[i]).map((i) => m.enProduccionDesde[i]).sort()[0]
    if (!desde) continue
    for (let vigencia = Number(desde.slice(0, 4)) - 1; vigencia <= Number(hoy.slice(0, 4)); vigencia++) {
      if (!calendarios.some((c) => c.vigencia === vigencia)) sinCalendario.push({ municipioId: m.id, vigencia })
    }

    for (const cal of calendarios) {
      for (const impuesto of IMPUESTOS.filter((i) => m.impuestos[i])) {
        const f = cal[impuesto]
        const pausa = cfg.formulariosDesactivados[impuesto]?.fecha
        for (const p of f.periodos) {
          const { inicio, fin } = rangoPeriodo(f.periodicidad, cal.vigencia, p.periodo)
          for (const ins of inscritos) {
            const calidad = ins.calidades.find((c) => c.calidad === CALIDAD_DEL_IMPUESTO[impuesto])
            if (!calidad || calidad.desde > fin) continue
            if (ins.regimenSimple && impuesto !== 'reteica') continue
            const cese = fechaCese(ins)
            if (cese && cese < inicio) continue
            const vencimiento = vencimientoPara(f, p, ins.documento)
            if (!vencimiento || vencimiento < m.enProduccionDesde[impuesto] || vencimiento >= hoy || (pausa && vencimiento >= pausa)) continue
            if (cubierto(`${ins.id}|${impuesto}|${cal.vigencia}`, inicio, fin)) continue
            if (impuesto === 'reteica' && !cfg.declaracionEnCeros) {
              agentesSinCeros.add(ins.id)
              continue
            }
            omisos.push({ inscripcion: ins, impuesto, vigencia: cal.vigencia, periodo: p.periodo, periodicidad: f.periodicidad, vencimiento })
          }
        }
      }
    }
  }

  omisos.sort((a, b) => a.vencimiento.localeCompare(b.vencimiento) || a.inscripcion.nombre.localeCompare(b.inscripcion.nombre))
  return { omisos, sinCeros: agentesSinCeros.size, sinCalendario }
}
