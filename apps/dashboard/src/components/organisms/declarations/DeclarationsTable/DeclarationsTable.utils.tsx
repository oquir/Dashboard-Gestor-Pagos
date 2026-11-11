import { columnHelper } from '../../../../lib'
import type { DeclarationRow } from '../../../../types'
import { Checkbox } from '../../../atoms'
import type { MarkAction } from './DeclarationsTable.types'

export const col = columnHelper<DeclarationRow>()

/** Casillas para elegir declaraciones; la del encabezado marca todas las filtradas, no solo la página. */
export function selectionColumn(
  rows: DeclarationRow[],
  selection: ReadonlySet<string>,
  mark: MarkAction,
) {
  const checkedOnes = rows.filter((f) => selection.has(f.d.id)).length
  return col.display({
    id: 'seleccion',
    header: () => (
      <Checkbox
        aria-label="Seleccionar todas las declaraciones filtradas"
        title={`Seleccionar las ${rows.length} declaraciones filtradas`}
        checked={rows.length > 0 && checkedOnes === rows.length}
        ref={(el) => {
          if (el) el.indeterminate = checkedOnes > 0 && checkedOnes < rows.length
        }}
        onChange={(e) =>
          mark(
            rows.map((f) => f.d.id),
            e.target.checked,
          )
        }
      />
    ),
    meta: { classes: 'w-10' },
    cell: ({
      row: {
        original: { d },
      },
    }) => (
      <Checkbox
        aria-label={`Seleccionar la declaración ${d.number}`}
        checked={selection.has(d.id)}
        onChange={(e) => mark([d.id], e.target.checked)}
      />
    ),
  })
}
