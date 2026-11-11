import { useMemo } from 'react'
import { nonFilerId, useSession } from '../../../../lib'
import { useData } from '../../../../store'
import Table from '../../Table'
import { COLUMNS, INITIAL_ORDER } from './NonFilersTable.constants'
import type { NonFilersTableProps } from './NonFilersTable.types'
import { col, summonsColumn, municipalityColumn, selectionColumn } from './NonFilersTable.utils'

/**
 * Periodos vencidos sin declarar, del más antiguo al más reciente, con su emplazamiento. Quien puede emplazar tiene
 * casillas para elegirlos. Cuando 1cero1 mira todos los municipios, agrega la columna de municipio.
 */
export default function NonFilersTable({ nonFilers, total, selection }: NonFilersTableProps) {
  const { municipalityId } = useSession()
  const municipalities = useData((s) => s.municipalities)
  const summonses = useData((s) => s.summonses)
  const columns = useMemo(
    () =>
      col.columns([
        ...(selection ? [selectionColumn(nonFilers, summonses, selection)] : []),
        ...COLUMNS,
        summonsColumn(summonses),
        ...(municipalityId === null ? [municipalityColumn(municipalities)] : []),
      ]),
    [nonFilers, summonses, selection, municipalityId, municipalities],
  )

  return (
    <Table
      data={nonFilers}
      columns={columns}
      perPage={15}
      initialOrder={INITIAL_ORDER}
      rowId={nonFilerId}
      name={`periodos sin declarar (de ${total})`}
      empty="No hay omisos con esos filtros"
    />
  )
}
