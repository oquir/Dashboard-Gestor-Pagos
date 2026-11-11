import { Calendar } from 'reicon-react'
import { formatDate } from '../../../../lib'
import { Notice } from '../../../molecules'
import type { NoCalendarNoticeProps } from './NoCalendarNotice.types'

/** En el detalle de una declaración presentada antes de que el municipio cargara el calendario de su año gravable. */
export default function NoCalendarNotice({ d, upload }: NoCalendarNoticeProps) {
  return (
    <Notice tone="alert" icon={Calendar}>
      <p className="font-medium">
        {upload
          ? `Se presentó el ${formatDate(d.filingDate)}, antes de que el municipio cargara el calendario del año gravable ${d.fiscalYear} (lo cargó ${upload.por || 'el municipio'} el ${formatDate(upload.date)}).`
          : `Se presentó sin el calendario del año gravable ${d.fiscalYear}: el municipio todavía no lo ha cargado.`}
      </p>
      <p className="mt-0.5">
        Revisa que el vencimiento, la sanción y los intereses estén bien: se liquidaron sin las
        fechas oficiales.
      </p>
    </Notice>
  )
}
