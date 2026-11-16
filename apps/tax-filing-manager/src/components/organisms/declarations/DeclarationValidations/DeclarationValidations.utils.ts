import {
  formatDate,
  formatPesos,
  isDownwardCorrection,
  taxDue,
  downwardCorrectionLimit,
  lateFilingPenalty,
  calculatedPenalty,
} from '../../../../lib'
import type { Declaration, Registration } from '../../../../types'
import { dayDifference } from '../../../../utils'
import type { PenaltyContext, Validation } from './DeclarationValidations.types'

/** Cruces automáticos que el funcionario ve antes de aprobar la declaración. */
export function validations(
  d: Declaration,
  reg: Registration | undefined,
  againstRit: boolean,
  corrected?: Declaration,
  { summons, penalties }: PenaltyContext = {},
) {
  const result: Validation[] = []
  const value = (code: string) => d.lines.find((r) => r.code === code)?.value ?? 0
  const has = (capacity: string) => reg?.capacities.some((c) => c.capacity === capacity) ?? false

  // Cruces con el RIT: solo si el municipio tiene el RIT y la validación activa en este formulario.
  if (againstRit) {
    if (d.tax === 'reteica') {
      result.push({
        ok: has('withholding_agent'),
        text: 'El contribuyente tiene la calidad de agente retenedor en el RIT',
      })
    }
    if (d.tax === 'selfWithholding') {
      result.push({
        ok: has('self_withholder'),
        text: 'El contribuyente está designado como autorretenedor en el RIT',
      })
    }
    if (d.tax === 'ica') {
      result.push({
        ok: !reg?.simpleRegime,
        text: 'El contribuyente no está en el SIMPLE según el RIT (allí el ICA se declara ante la DIAN)',
      })
      if (value('28') > 0)
        result.push({
          ok: has('self_withholder'),
          text: 'Las autorretenciones (renglón 28) corresponden a un autorretenedor del RIT',
        })
    }
  }
  // La extemporaneidad es de la inicial: una corrección no es extemporánea por presentarse después del vencimiento
  // (art. 644, parágrafo 1, del Estatuto Tributario).
  if (d.kind === 'initial') {
    const late = d.filingDate > d.dueDate
    const penalty = calculatedPenalty(d)
    // Después del emplazamiento para declarar, la extemporaneidad es la del art. 642: se revisa que llegue a lo que da.
    if (late && summons?.kind === 'file' && penalties) {
      const expected = lateFilingPenalty(
        taxDue(d),
        dayDifference(d.dueDate, d.filingDate),
        penalties,
        true,
      )
      result.push({
        ok: penalty >= expected,
        text: `Presentada después del emplazamiento para declarar N.º ${summons.number}, notificado el ${formatDate(summons.notificationDate)}: liquida la extemporaneidad del art. 642, al ${penalties.summonsLateFiling} % por mes, de al menos ${formatPesos(expected)}`,
      })
    } else {
      result.push(
        late
          ? {
              ok: penalty > 0,
              text: 'Presentada después del vencimiento: liquida sanción por extemporaneidad',
            }
          : { ok: true, text: 'Presentada dentro del plazo' },
      )
    }
  }
  if (d.kind === 'correction')
    result.push({ ok: Boolean(d.correctsId), text: 'Indica la declaración que corrige' })
  // Después del emplazamiento para corregir, la sanción por corrección es la del art. 644, numeral 2. El dashboard no
  // rehace el mayor valor: revisa que la corrección agregue sanción. Corregir a la baja no la lleva (parágrafo 4).
  if (
    d.kind === 'correction' &&
    summons?.kind === 'correct' &&
    penalties &&
    !isDownwardCorrection(d, corrected)
  ) {
    result.push({
      ok: calculatedPenalty(d) > (corrected ? calculatedPenalty(corrected) : 0),
      text: `Corrige después del emplazamiento para corregir N.º ${summons.number}, notificado el ${formatDate(summons.notificationDate)}: liquida la sanción por corrección del art. 644, numeral 2, del ${penalties.summonsCorrection} % del mayor valor`,
    })
  }
  // La corrección a la baja, directa o con solicitud, se presenta dentro del año siguiente al vencimiento (art. 589).
  if (isDownwardCorrection(d, corrected)) {
    result.push({
      ok: d.filingDate <= downwardCorrectionLimit(d.dueDate),
      text: `Se presentó dentro del año siguiente al vencimiento, hasta el ${formatDate(downwardCorrectionLimit(d.dueDate))} (art. 589)`,
    })
  }
  if (d.kind === 'closure')
    result.push({ ok: Boolean(d.closingDate), text: 'Indica la fecha exacta de cierre' })
  return result
}
