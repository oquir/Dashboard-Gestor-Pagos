import { Link } from 'react-router'
import { formatDate, formatPesos, lowestValue } from '../../../../lib'
import { Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import type { DeclarationDataProps } from './DeclarationData.types'

/** Ficha de la declaración: factura, fechas y la declaración que corrige. */
export default function DeclarationData({ d, corrected, downward = false }: DeclarationDataProps) {
  const daysLate = Math.round((Date.parse(d.filingDate) - Date.parse(d.dueDate)) / 86400000)

  return (
    <Card>
      <CardHeader title="Datos" />
      <dl className="space-y-4 p-5">
        <DataItem label="Número de factura">
          <span className="tabular-nums">{d.invoiceNumber}</span>
        </DataItem>
        <DataItem label="Vencimiento">{formatDate(d.dueDate)}</DataItem>
        <DataItem label="Presentación">
          {formatDate(d.filingDate)}
          {/* Solo la inicial llega tarde: la corrección se presenta después del vencimiento sin ser extemporánea. */}
          {d.kind === 'initial' && daysLate > 0 && (
            <span className="text-amber-700"> · {daysLate} días tarde</span>
          )}
        </DataItem>
        {d.closingDate && <DataItem label="Fecha de cierre">{formatDate(d.closingDate)}</DataItem>}
        {corrected && (
          <DataItem label="Corrige a">
            <Link
              className="font-medium text-brand-700 hover:underline"
              to={`/declaraciones/${corrected.id}`}
            >
              {corrected.number}
            </Link>
            {downward && (
              <span className="block text-xs text-slate-500">
                A la baja: {formatPesos(lowestValue(d, corrected))} menos. No lleva sanción por
                corrección.
              </span>
            )}
          </DataItem>
        )}
      </dl>
    </Card>
  )
}
