import type { SummonsSituation } from '../../../../lib'
import { formatDate } from '../../../../lib'
import type { Summons } from '../../../../types'

/** En una línea: hasta cuándo tiene, cuándo venció o cuándo respondió. */
export function termText(e: Summons, { status, limit, response }: SummonsSituation) {
  if (response)
    return `${e.kind === 'file' ? 'Declaró' : 'Corrigió'} el ${formatDate(response.filingDate)}`
  if (status === 'on_time') return `Plazo hasta el ${formatDate(limit)}`
  return `Venció el ${formatDate(limit)} sin ${e.kind === 'file' ? 'declarar' : 'corregir'}`
}
