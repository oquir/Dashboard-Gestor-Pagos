import { Add } from 'reicon-react'
import { useState } from 'react'
import { Link } from 'react-router'
import {
  previousSummons,
  summonsesToCorrect,
  summonsSituation,
  taxLabel,
  periodLabel,
  summonsTypeLabel,
} from '../../../../lib'
import { useData } from '../../../../store'
import { today } from '../../../../utils'
import { Button, Card } from '../../../atoms'
import { CardHeader } from '../../../molecules'
import SummonsSummary from '../SummonsSummary'
import SummonsModal from '../SummonsModal'
import type { DeclarationSummonsesProps } from './DeclarationSummonses.types'

/**
 * Los emplazamientos de la declaración: al que responde (el de declarar de su periodo o el de corregir de la que corrige)
 * y los de corregir notificados sobre ella. En una declaración vigente, el administrador y el funcionario registran
 * el emplazamiento para corregir que el municipio notificó.
 */
export default function DeclarationSummonses({ d, canRecord }: DeclarationSummonsesProps) {
  const declarations = useData((s) => s.declarations)
  const summonses = useData((s) => s.summonses)
  const [recording, setRecording] = useState(false)
  const prior = previousSummons(d, declarations, summonses)
  const summoned =
    prior?.kind === 'correct' ? declarations.find((x) => x.id === prior.declarationId) : undefined
  const own = summonsesToCorrect(d, summonses)
  if (!prior && own.length === 0 && !canRecord) return null

  return (
    <Card>
      <CardHeader
        title="Emplazamientos"
        description="Los que el municipio notificó y registró aquí. Desde la notificación, la sanción es más alta."
        actions={
          canRecord && (
            <Button variant="secondary" onClick={() => setRecording(true)}>
              <Add className="size-4" aria-hidden /> Para corregir
            </Button>
          )
        }
      />
      <div className="space-y-4 p-5">
        {prior && (
          <div>
            <p className="text-sm font-medium text-slate-900">
              {d.kind === 'correction' ? 'Corrige' : 'Se presentó'} después del{' '}
              {summonsTypeLabel[prior.kind].toLowerCase()}
            </p>
            {summoned && (
              <p className="text-xs text-slate-500">
                Notificado sobre la{' '}
                <Link
                  className="font-medium text-brand-700 underline"
                  to={`/declaraciones/${summoned.id}`}
                >
                  {summoned.number}
                </Link>
                .
              </p>
            )}
            <SummonsSummary e={prior} detail className="mt-2" />
          </div>
        )}
        {own.map((e) => {
          const response = summonsSituation(e, declarations, today()).response
          return (
            <div key={e.id}>
              <p className="text-sm font-medium text-slate-900">{summonsTypeLabel[e.kind]}</p>
              {response && (
                <p className="text-xs text-slate-500">
                  Lo respondió la corrección{' '}
                  <Link
                    className="font-medium text-brand-700 underline"
                    to={`/declaraciones/${response.id}`}
                  >
                    {response.number}
                  </Link>
                  .
                </p>
              )}
              <SummonsSummary e={e} detail className="mt-2" />
            </div>
          )
        })}
        {!prior && own.length === 0 && (
          <p className="text-sm text-slate-500">
            No tiene emplazamientos. Si el municipio le notificó uno para corregir, regístralo para
            que el aplicativo le liquide la sanción del art. 644, numeral 2.
          </p>
        )}
      </div>

      {recording && (
        <SummonsModal
          kind="correct"
          recipients={[
            {
              key: d.id,
              title: d.taxpayer.name,
              description: `${taxLabel[d.tax]} · ${periodLabel(d)} · radicado ${d.number}`,
              from: d.filingDate,
              destination: {
                kind: 'correct',
                municipalityId: d.municipalityId,
                declarationId: d.id,
              },
            },
          ]}
          close={() => setRecording(false)}
        />
      )}
    </Card>
  )
}
