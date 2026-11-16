import {
  nonFilerSummons,
  taxLabel,
  periodLabel,
  formatDate,
  formatDaysAgo,
  inProductionText,
  nonFilerId,
  useNonFilers,
} from '../../../../lib'
import { useData } from '../../../../store'
import { dayDifference, today } from '../../../../utils'
import { Badge, Card } from '../../../atoms'
import { CardHeader, EmptyState } from '../../../molecules'
import SummonsSummary from '../../declarations/SummonsSummary'
import type { MissingDeclarationsProps } from './MissingDeclarations.types'

/** Periodos vencidos que el inscrito debía declarar y no ha declarado, desde que cada formulario salió a producción en el aplicativo. */
export default function MissingDeclarations({ registration }: MissingDeclarationsProps) {
  const { nonFilers } = useNonFilers(registration.municipalityId)
  const municipality = useData((s) =>
    s.municipalities.find((m) => m.id === registration.municipalityId),
  )
  const summonses = useData((s) => s.summonses)
  const theirs = nonFilers.filter((o) => o.registration.id === registration.id)
  const from = municipality && inProductionText(municipality)

  return (
    <Card>
      <CardHeader
        title="Declaraciones que faltan"
        description={
          from
            ? `Periodos vencidos sin declarar desde ${from}, cuando los formularios salieron a producción en el aplicativo.`
            : 'El municipio no tiene formularios activos en el aplicativo.'
        }
      />
      {theirs.length === 0 ? (
        <EmptyState title="Está al día" description="No le falta ninguna declaración vencida." />
      ) : (
        <ul className="divide-y divide-border-subtle">
          {theirs.map((o) => {
            const e = nonFilerSummons(o, summonses)
            return (
              <li key={nonFilerId(o)} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg-strong">
                    {taxLabel[o.tax]} · {periodLabel(o)}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    Venció el {formatDate(o.dueDateItem)}
                  </p>
                  {e && <SummonsSummary e={e} className="mt-2" />}
                </div>
                <Badge tone="danger">
                  Omiso {formatDaysAgo(dayDifference(o.dueDateItem, today()))}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
