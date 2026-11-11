// Omisos: inscritos en el RIT que debían declarar un periodo ya vencido y no lo hicieron (docs/Pendientes-y-decisiones.md, §3.5).
import type {
  Capacity,
  MunicipalityConfig,
  Declaration,
  Tax,
  Registration,
  Municipality,
  NonFiler,
  NonFilersResult,
} from '../types'
import { periodRange, dueDateFor } from './calendar'

/** La calidad del RIT que obliga a presentar cada formulario. */
const TAX_CAPACITY: Record<Tax, Capacity> = {
  ica: 'taxpayer',
  reteica: 'withholding_agent',
  selfWithholding: 'self_withholder',
}
const TAXES = Object.keys(TAX_CAPACITY) as Tax[]

/** Fecha de cese de una inscripción cancelada; undefined si no está cancelada. */
function cessationDate(reg: Registration) {
  if (reg.status !== 'cancelled') return undefined
  const cancellation = reg.ritChanges.findLast(
    (n) => n.kind === 'cancellation' && n.status === 'approved',
  )
  return cancellation?.cancellation?.cessationDate ?? cancellation?.date
}

/** Identifica un omiso: el inscrito, el formulario y el periodo. */
export const nonFilerId = (o: NonFiler) =>
  `${o.registration.id}-${o.tax}-${o.fiscalYear}-${o.period}`

interface Source {
  municipalities: Municipality[]
  settingsList: MunicipalityConfig[]
  registrations: Registration[]
  declarations: Declaration[]
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
export function computeNonFilers(
  { municipalities, settingsList, registrations, declarations }: Source,
  municipalityId: string | null,
  today: string,
): NonFilersResult {
  const nonFilers: NonFiler[] = []
  const agentsWithoutZeros = new Set<string>()
  const withoutCalendar: NonFilersResult['withoutCalendar'] = []
  // Los omisos salen del RIT: solo cuentan las declaraciones de los inscritos. Por inscrito, formulario y año, las
  // fechas que cubre cada una.
  const filed = new Map<string, { start: string; end: string }[]>()
  for (const d of declarations) {
    if (!d.registrationId || d.approval?.status === 'rejected') continue
    const key = `${d.registrationId}|${d.tax}|${d.fiscalYear}`
    filed.set(key, [...(filed.get(key) ?? []), periodRange(d.frequency, d.fiscalYear, d.period)])
  }
  const covered = (key: string, start: string, end: string) =>
    filed.get(key)?.some((r) => r.start <= end && start <= r.end) ?? false

  for (const m of municipalities) {
    if (!m.rit || (municipalityId !== null && m.id !== municipalityId)) continue
    const cfg = settingsList.find((c) => c.municipalityId === m.id)
    if (!cfg) continue
    const calendars = cfg.taxCalendar.byFiscalYear
    const registered = registrations.filter(
      (i) => i.municipalityId === m.id && (i.status === 'active' || i.status === 'cancelled'),
    )

    // Los impuestos activos con su salida a producción; sin ella, el impuesto no se revisa.
    const inProduction = TAXES.flatMap((i) => {
      const date = m.taxes[i] && m.inProductionSince[i]
      return date ? [{ tax: i, from: date }] : []
    })
    // Desde el año anterior al de la primera salida a producción, porque su ICA anual vence en el año siguiente, hasta el año en curso.
    const from = inProduction.map((x) => x.from).sort()[0]
    if (!from) continue
    for (
      let fiscalYear = Number(from.slice(0, 4)) - 1;
      fiscalYear <= Number(today.slice(0, 4));
      fiscalYear++
    ) {
      if (!calendars.some((c) => c.fiscalYear === fiscalYear))
        withoutCalendar.push({ municipalityId: m.id, fiscalYear })
    }

    for (const cal of calendars) {
      for (const { tax, from: fromTax } of inProduction) {
        const f = cal[tax]
        const pausa = cfg.disabledForms[tax]?.date
        for (const p of f.periods) {
          const { start, end } = periodRange(f.frequency, cal.fiscalYear, p.period)
          for (const reg of registered) {
            const capacity = reg.capacities.find((c) => c.capacity === TAX_CAPACITY[tax])
            if (!capacity || capacity.from > end) continue
            if (reg.simpleRegime && tax !== 'reteica') continue
            const cessation = cessationDate(reg)
            if (cessation && cessation < start) continue
            const dueDateItem = dueDateFor(f, p, reg.document)
            if (
              !dueDateItem ||
              dueDateItem < fromTax ||
              dueDateItem >= today ||
              (pausa && dueDateItem >= pausa)
            )
              continue
            if (covered(`${reg.id}|${tax}|${cal.fiscalYear}`, start, end)) continue
            if (tax === 'reteica' && !cfg.zeroDeclaration) {
              agentsWithoutZeros.add(reg.id)
              continue
            }
            nonFilers.push({
              registration: reg,
              tax,
              fiscalYear: cal.fiscalYear,
              period: p.period,
              frequency: f.frequency,
              dueDateItem,
            })
          }
        }
      }
    }
  }

  nonFilers.sort(
    (a, b) =>
      a.dueDateItem.localeCompare(b.dueDateItem) ||
      a.registration.name.localeCompare(b.registration.name),
  )
  return { nonFilers, withoutZeros: agentsWithoutZeros.size, withoutCalendar }
}
