import {
  nonFilerSummons,
  summonsSituation,
  summonsStatusLabel,
  registrationStatusLabel,
  taxLabel,
  periodLabel,
  documentFormat,
  formatDate,
  normalize,
  nonFilerId,
} from '../../../../lib'
import type {
  Declaration,
  Summons,
  SummonsStatus,
  NonFiler,
  NonFilersResult,
} from '../../../../types'
import { dayDifference } from '../../../../utils'
import type { Recipient } from '../SummonsModal'

/** Opciones del filtro de año gravable: los años que tienen omisos, del más reciente al más antiguo. */
export function yearOptions(nonFilers: NonFiler[]) {
  const years = [...new Set(nonFilers.map((o) => o.fiscalYear))].sort((a, b) => b - a)
  return Object.fromEntries([
    ['', 'Todo año gravable'],
    ...years.map((v) => [String(v), `Año gravable ${v}`]),
  ]) as Record<string, string>
}

/** Omisos que coinciden con el texto (nombre, documento o número de RIT) y con el año gravable elegido. */
export function filterNonFilers(nonFilers: NonFiler[], text: string, year: string) {
  const query = normalize(text)
  return nonFilers.filter(
    ({ registration: i, fiscalYear }) =>
      (!year || String(fiscalYear) === year) &&
      (!query ||
        normalize(i.name).includes(query) ||
        i.document.includes(query) ||
        i.ritNumber.includes(query)),
  )
}

/** Años sin calendario: sus omisos no se pueden revisar. Con todos los municipios, dice de cuál es cada año. */
export function noCalendarText(
  list: NonFilersResult['withoutCalendar'],
  firstNames: Map<string, string>,
  all: boolean,
) {
  const years = list
    .map((x) =>
      all ? `${firstNames.get(x.municipalityId)} ${x.fiscalYear}` : String(x.fiscalYear),
    )
    .join(', ')
  return list.length === 1
    ? `No hay calendario del año gravable ${years}: sus omisos no se pueden revisar hasta cargarlo en Calendario.`
    : `No hay calendario de los años gravables ${years}: sus omisos no se pueden revisar hasta cargarlos en Calendario.`
}

/** Agentes de ReteICA sin declarar en municipios que no exigen la declaración en ceros. */
export const withoutZerosText = (agents: number) =>
  `${agents === 1 ? 'Un agente de ReteICA no presentó' : `${agents} agentes de ReteICA no presentaron`} alguna declaración y no se ${agents === 1 ? 'marca como omiso' : 'marcan como omisos'}: el municipio no exige la declaración en ceros, así que pudieron no haber retenido nada en ese periodo.`

/** Si el omiso tiene emplazamiento y en qué va; mientras sea omiso, solo puede estar en plazo o vencido. */
export function summonsStatusOf(
  o: NonFiler,
  summonses: Summons[],
  declarations: Declaration[],
  today: string,
) {
  const e = nonFilerSummons(o, summonses)
  return e ? summonsSituation(e, declarations, today).status : 'no_summons'
}

/** El omiso como destinatario de un emplazamiento para declarar. */
export const recipientOf = (o: NonFiler): Recipient => ({
  key: nonFilerId(o),
  title: o.registration.name,
  description: `${taxLabel[o.tax]} · ${periodLabel(o)} · venció el ${formatDate(o.dueDateItem)}`,
  from: o.dueDateItem,
  destination: {
    kind: 'file',
    municipalityId: o.registration.municipalityId,
    registrationId: o.registration.id,
    tax: o.tax,
    fiscalYear: o.fiscalYear,
    frequency: o.frequency,
    period: o.period,
  },
})

/** Una fila del Excel, en el orden de COLUMNAS_EXCEL. */
export function excelRow(
  o: NonFiler,
  firstNames: Map<string, string>,
  today: string,
  summons?: { e: Summons; status: SummonsStatus },
): (string | number)[] {
  const i = o.registration
  return [
    firstNames.get(i.municipalityId) ?? '',
    i.ritNumber,
    i.name,
    documentFormat(i),
    registrationStatusLabel[i.status],
    taxLabel[o.tax],
    periodLabel(o),
    o.dueDateItem,
    dayDifference(o.dueDateItem, today),
    summons?.e.number ?? '',
    summons?.e.notificationDate ?? '',
    summons ? summonsStatusLabel[summons.status] : 'Sin emplazamiento',
    i.phone,
    i.email,
    i.address,
  ]
}
