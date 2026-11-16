import { nonFilerSummons, periodLabel, nonFilerId, columnHelper } from '../../../../lib'
import type { Summons, Municipality, NonFiler } from '../../../../types'
import { Checkbox } from '../../../atoms'
import SummonsSummary from '../SummonsSummary'
import type { NonFilerSelection } from './NonFilersTable.types'

export const col = columnHelper<NonFiler>()

export const municipalityColumn = (municipalities: Municipality[]) =>
  col.accessor(
    (o) => municipalities.find((m) => m.id === o.registration.municipalityId)?.name ?? '',
    {
      id: 'municipality',
      header: 'Municipio',
      meta: { classes: 'whitespace-nowrap text-fg' },
    },
  )

/** Casillas para elegir los omisos que se emplazan; la del encabezado marca todos los filtrados que aún no tienen emplazamiento. */
export function selectionColumn(
  nonFilers: NonFiler[],
  summonses: Summons[],
  { selection, mark }: NonFilerSelection,
) {
  const available = nonFilers.filter((o) => !nonFilerSummons(o, summonses)).map(nonFilerId)
  const checkedOnes = available.filter((id) => selection.has(id)).length
  return col.display({
    id: 'selection',
    header: () => (
      <Checkbox
        aria-label="Seleccionar los omisos filtrados sin emplazamiento"
        title={`Seleccionar los ${available.length} omisos filtrados sin emplazamiento`}
        disabled={available.length === 0}
        checked={available.length > 0 && checkedOnes === available.length}
        ref={(el) => {
          if (el) el.indeterminate = checkedOnes > 0 && checkedOnes < available.length
        }}
        onChange={(e) => mark(available, e.target.checked)}
      />
    ),
    meta: { classes: 'w-10' },
    cell: ({ row: { original: o } }) => {
      const summonedItem = Boolean(nonFilerSummons(o, summonses))
      return (
        <Checkbox
          aria-label={`Seleccionar a ${o.registration.name}, ${periodLabel(o)}`}
          title={summonedItem ? 'Ya tiene emplazamiento' : undefined}
          disabled={summonedItem}
          checked={selection.has(nonFilerId(o))}
          onChange={(e) => mark([nonFilerId(o)], e.target.checked)}
        />
      )
    },
  })
}

/** El emplazamiento para declarar del omiso, si se registró. Ordena por la fecha de notificación. */
export const summonsColumn = (summonses: Summons[]) =>
  col.accessor((o) => nonFilerSummons(o, summonses)?.notificationDate ?? '', {
    id: 'summons',
    header: 'Emplazamiento',
    meta: { classes: 'min-w-52' },
    cell: ({ row: { original: o } }) => {
      const e = nonFilerSummons(o, summonses)
      return e ? (
        <SummonsSummary e={e} />
      ) : (
        <span className="text-xs text-fg-subtle">Sin emplazamiento</span>
      )
    },
  })
