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
 * - no presentó ninguna declaración del periodo. La rechazada en la aprobación previa se tiene por no presentada
 *   (art. 580 ET); la ineficaz cuenta como presentada.
 * La ReteICA de un municipio que no exige la declaración en ceros no se marca: el agente pudo no retener nada.
 */
export function calcularOmisos({ municipios, configuraciones, inscripciones, declaraciones }: Fuente, municipioId: string | null, hoy: string): ResultadoOmisos {
  const omisos: Omiso[] = []
  const agentesSinCeros = new Set<string>()
  const sinCalendario: ResultadoOmisos['sinCalendario'] = []
  // Los omisos salen del RIT: solo cuentan las declaraciones de los inscritos.
  const presentadas = new Set(
    declaraciones
      .filter((d) => d.inscripcionId && d.aprobacion?.estado !== 'rechazada')
      .map((d) => `${d.inscripcionId}|${d.impuesto}|${d.vigencia}|${d.periodo}`),
  )

  for (const m of municipios) {
    if (!m.rit || (municipioId !== null && m.id !== municipioId)) continue
    const cfg = configuraciones.find((c) => c.municipioId === m.id)
    if (!cfg) continue
    const calendarios = cfg.calendarioTributario.porVigencia
    const inscritos = inscripciones.filter((i) => i.municipioId === m.id && (i.estado === 'activa' || i.estado === 'cancelada'))

    // Desde el año anterior al de inicio, porque su ICA anual vence en el año siguiente, hasta el año en curso.
    for (let vigencia = Number(m.declaracionesDesde.slice(0, 4)) - 1; vigencia <= Number(hoy.slice(0, 4)); vigencia++) {
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
            if (!vencimiento || vencimiento < m.declaracionesDesde || vencimiento >= hoy || (pausa && vencimiento >= pausa)) continue
            if (presentadas.has(`${ins.id}|${impuesto}|${cal.vigencia}|${p.periodo}`)) continue
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
