import { capacityLabel, formatDate } from '../../../../lib'
import { Badge, Card } from '../../../atoms'
import { CardHeader, DataItem } from '../../../molecules'
import { ENABLES } from './RitCard.constants'
import type { CardField, RitCardProps } from './RitCard.types'
import { fields, accountantFields } from './RitCard.utils'

/** Datos, contador, calidades y actividades del inscrito. Con `anterior`, marca lo que cambió frente a ese formulario. */
export default function RitCard({ data, previous, rates }: RitCardProps) {
  const added = (newItem: boolean) => previous && newItem && <Badge tone="alert">Agregada</Badge>
  const withAccountant = data.accountant || previous?.accountant

  return (
    <>
      <Card>
        <CardHeader title="Datos del inscrito" />
        <FieldList currentOnes={fields(data)} previousOnes={previous && fields(previous)} />
      </Card>

      <Card>
        <CardHeader
          title="Contador o revisor fiscal"
          description="Firma las declaraciones. Lo registra quien está obligado a llevar contabilidad."
        />
        {withAccountant ? (
          <FieldList
            currentOnes={accountantFields(data.accountant)}
            previousOnes={previous && accountantFields(previous.accountant)}
          />
        ) : (
          <p className="p-5 text-sm text-fg-muted">No registró contador ni revisor fiscal.</p>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Calidades"
          description="Nacen de la norma o del acto de designación, no de la inscripción."
        />
        <ul className="divide-y divide-border-subtle">
          {data.capacities.map((c) => (
            <li
              key={c.capacity}
              className="flex flex-wrap items-start justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-fg-strong">
                  {capacityLabel[c.capacity]}{' '}
                  {added(!previous?.capacities.some((a) => a.capacity === c.capacity))}
                </p>
                <p className="text-xs text-fg-muted">{ENABLES[c.capacity]}</p>
              </div>
              <div className="text-right text-xs text-fg-muted">
                <p>Desde {formatDate(c.from)}</p>
                {c.act && <p>{c.act}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Actividades económicas" />
        <ul className="divide-y divide-border-subtle">
          {data.activities.map((a) => (
            <li key={a.ciiu} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div>
                <span className="tabular-nums text-fg-muted">CIIU {a.ciiu}</span> ·{' '}
                <span className="text-fg-strong">{a.description}</span>
                {a.main && <Badge tone="info">Principal</Badge>}{' '}
                {added(!previous?.activities.some((x) => x.ciiu === a.ciiu))}
              </div>
              {rates && (
                <span className="whitespace-nowrap text-fg-soft">
                  {rates.find((t) => t.ciiu === a.ciiu)?.perThousand ?? '—'} por mil
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}

/** Los datos en dos columnas; con `anteriores`, cada uno que cambió lleva lo que decía antes. */
function FieldList({
  currentOnes,
  previousOnes,
}: {
  currentOnes: CardField[]
  previousOnes?: CardField[]
}) {
  const before = previousOnes && new Map(previousOnes)
  return (
    <dl className="grid gap-5 p-5 sm:grid-cols-2">
      {currentOnes.map(([label, value]) => {
        const prior = before?.get(label)
        if (!value && !prior) return null
        return (
          <DataItem key={label} label={label}>
            {value ?? '—'}
            {before && prior !== value && (
              <>
                {' '}
                <Badge tone="alert">Modificado</Badge>
                <span className="mt-0.5 block text-xs text-fg-muted">Antes: {prior ?? '—'}</span>
              </>
            )}
          </DataItem>
        )
      })}
    </dl>
  )
}
