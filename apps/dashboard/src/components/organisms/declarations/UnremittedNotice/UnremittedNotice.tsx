import { Danger } from 'reicon-react'
import { formatDate, remittanceTerm } from '../../../../lib'
import { Notice } from '../../../molecules'
import type { UnremittedNoticeProps } from './UnremittedNotice.types'

/** En el detalle de una ReteICA o AutoReteICA con saldo: hasta cuándo hay para consignarlo y qué pasa si no. */
export default function UnremittedNotice({ r }: UnremittedNoticeProps) {
  const withheld = r.d.tax === 'selfWithholding' ? 'Lo autorretenido' : 'Lo retenido'

  if (r.days < 0) {
    return (
      <Notice tone="danger" icon={Danger} role="alert">
        <p className="font-medium">
          {withheld} no se consignó a tiempo: el plazo de 2 meses venció el {formatDate(r.limit)}.
        </p>
        <p className="mt-0.5">
          No consignarlo puede ser delito (art. 402 del Código Penal). Si paga todo con intereses,
          se puede cerrar el proceso penal.
        </p>
      </Notice>
    )
  }
  return (
    <Notice tone="alert" icon={Danger}>
      <p className="font-medium">
        {withheld} no se ha consignado. Hay plazo hasta el {formatDate(r.limit)} (
        {remittanceTerm(r.days).toLowerCase()}), 2 meses después del vencimiento de la declaración.
      </p>
      <p className="mt-0.5">
        Si para entonces no se paga completo, puede ser delito (art. 402 del Código Penal).
      </p>
    </Notice>
  )
}
