import { dateRange, taxLabel, periodLabel, TAXES } from '../../../../lib'
import type { MunicipalityConfig, Municipality } from '../../../../types'
import { dayDifference } from '../../../../utils'
import type { UpcomingDueDate } from './UpcomingDueDates.types'
import { HOW_MANY, DAYS_OVERDUE } from './UpcomingDueDates.constants'

/**
 * Vencimientos más cercanos de los formularios activos del municipio (o de todos, si no hay uno elegido):
 * los que vienen y los que vencieron hace poco, del más cercano al más lejano.
 */
export function upcomingDueDates(
  settingsList: MunicipalityConfig[],
  municipalities: Municipality[],
  municipalityId: string | null,
  today: string,
) {
  const list: UpcomingDueDate[] = []
  for (const cfg of settingsList) {
    if (municipalityId && cfg.municipalityId !== municipalityId) continue
    const activeOnes = municipalities.find((m) => m.id === cfg.municipalityId)?.taxes
    for (const cal of cfg.taxCalendar.byFiscalYear) {
      for (const tax of TAXES.filter((i) => activeOnes?.[i])) {
        const f = cal[tax]
        for (const p of f.periods) {
          const range = dateRange(f, p)
          if (!range) continue
          list.push({
            id: `${cfg.municipalityId}-${cal.fiscalYear}-${tax}-${p.period}`,
            tax: taxLabel[tax],
            periodText: periodLabel({
              tax,
              frequency: f.frequency,
              fiscalYear: cal.fiscalYear,
              period: p.period,
            }),
            date: range.from,
            to: range.to !== range.from ? range.to : undefined,
            decree: cal.decree,
            daysLeft: dayDifference(today, range.from),
            daysUntil: dayDifference(today, range.to),
          })
        }
      }
    }
  }
  return list
    .filter((v) => v.daysUntil >= -DAYS_OVERDUE)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, HOW_MANY)
}
