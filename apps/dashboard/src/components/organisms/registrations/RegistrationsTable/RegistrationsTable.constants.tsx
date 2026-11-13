import { Link } from 'react-router'
import { AddressCard } from 'reicon-react'
import { ROW_BUTTON_CLASS } from '../../../../constants'
import {
  capacityLabel,
  registrationStatusLabel,
  ritChangeStatusLabel,
  ritChangeKindLabel,
  personTypeLabel,
  documentFormat,
  formatDate,
  lastProcedure,
  registrationTone,
} from '../../../../lib'
import { Badge } from '../../../atoms'
import { col } from './RegistrationsTable.utils'

export const COLUMNS = col.columns([
  col.accessor('ritNumber', {
    header: 'RIT',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ row: { original: i } }) => (
      <Link
        to={`/rit/${i.id}`}
        aria-label={`Ver la inscripción ${i.ritNumber} de ${i.name}`}
        className={ROW_BUTTON_CLASS}
      >
        <AddressCard className="size-4 text-brand-fg" aria-hidden />
        {i.ritNumber}
      </Link>
    ),
  }),
  col.accessor('name', {
    header: 'Nombre o razón social',
    // Sin ancho mínimo, las razones sociales largas se partían en tres o cuatro líneas.
    meta: { classes: 'min-w-72' },
    cell: ({ row: { original: i } }) => <p className="font-medium text-fg-strong">{i.name}</p>,
  }),
  col.accessor((i) => documentFormat(i), {
    id: 'idDocument',
    header: 'Documento',
    meta: { classes: 'whitespace-nowrap tabular-nums text-fg' },
  }),
  col.accessor((i) => personTypeLabel[i.personType], {
    id: 'tipoPersona',
    header: 'Tipo de persona',
    meta: { classes: 'whitespace-nowrap text-fg' },
  }),
  col.display({
    id: 'capacities',
    header: 'Calidades',
    cell: ({ row: { original: i } }) => (
      <div className="flex flex-wrap gap-1">
        {i.capacities.map((c) => (
          <Badge key={c.capacity} tone={c.capacity === 'taxpayer' ? 'neutral' : 'info'}>
            {capacityLabel[c.capacity]}
          </Badge>
        ))}
        {i.simpleRegime && <Badge>SIMPLE</Badge>}
      </div>
    ),
  }),
  col.accessor((i) => ritChangeKindLabel[lastProcedure(i).kind], {
    id: 'procedure',
    header: 'Tipo de trámite',
    meta: { classes: 'whitespace-nowrap' },
    cell: ({ row: { original: i } }) => {
      const t = lastProcedure(i)
      return (
        <>
          <p className="text-fg-strong">{ritChangeKindLabel[t.kind]}</p>
          <p
            className={`text-xs ${t.status === 'pending' ? 'font-medium text-warning-fg' : 'text-fg-muted'}`}
          >
            {ritChangeStatusLabel[t.status]} · {formatDate(t.date)}
          </p>
        </>
      )
    },
  }),
  col.accessor((i) => registrationStatusLabel[i.status], {
    id: 'status',
    header: 'Estado',
    cell: ({ row: { original: i } }) => (
      <Badge tone={registrationTone[i.status]}>{registrationStatusLabel[i.status]}</Badge>
    ),
  }),
])
