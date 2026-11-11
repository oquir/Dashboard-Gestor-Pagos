import {
  taxLabel,
  periodLabel,
  declarationTypeLabel,
  formatDate,
  formatPesos,
} from '../../../../lib'
import { Card } from '../../../atoms'
import { CardHeader, LinkItem, EmptyState } from '../../../molecules'
import type { FiledDeclarationsProps } from './FiledDeclarations.types'

/** Declaraciones del inscrito; cada una lleva a su detalle. */
export default function FiledDeclarations({ declarations, simpleRegime }: FiledDeclarationsProps) {
  return (
    <Card>
      <CardHeader title="Declaraciones presentadas" />
      {declarations.length === 0 ? (
        <EmptyState
          title="Sin declaraciones"
          description={
            simpleRegime ? 'Está en el SIMPLE: su ICA se declara ante la DIAN.' : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-slate-100">
          {declarations.map((d) => (
            <LinkItem
              key={d.id}
              a={`/declaraciones/${d.id}`}
              title={`${taxLabel[d.tax]} · ${periodLabel(d)}`}
              detail={`${d.number} · ${declarationTypeLabel[d.kind]} · presentada el ${formatDate(d.filingDate)}`}
              right={
                <span className="whitespace-nowrap text-sm tabular-nums text-slate-700">
                  {formatPesos(d.totalToPay)}
                </span>
              }
            />
          ))}
        </ul>
      )}
    </Card>
  )
}
