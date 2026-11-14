import { useMemo } from 'react'
import { buildLinkedLabelIndex } from '../../../lib'
import { getAllFields, useFormStore } from '../../../store'
import type { CanvasField } from '../../../types'
import type { RepeatableGroup } from '../../../types'
import { CanvasRow } from '../CanvasRow'
import { RepeatableGroupBand } from '../RepeatableGroupBand'
import type { CanvasBlock, CanvasRowsGridProps, RowDisplacement } from './CanvasRowsGrid.types'
import { buildRowDisplacement, toCanvasBlocks } from './CanvasRowsGrid.utils'

export function CanvasRowsGrid({ rows, groups, onFieldContextMenu }: CanvasRowsGridProps) {
  const rowDrag = useFormStore((state) => state.rowDrag)
  const rowDropTarget = useFormStore((state) => state.rowDropTarget)
  const linkedLabels: Map<string, CanvasField> = useMemo(
    () => buildLinkedLabelIndex(getAllFields(rows)),
    [rows],
  )

  const blocks: CanvasBlock[] = toCanvasBlocks(rows)
  const displacement: RowDisplacement = buildRowDisplacement(blocks, rows, rowDrag, rowDropTarget)

  return (
    <ul className="grid list-none grid-cols-16 content-start gap-3">
      {blocks.map((block) => {
        if (block.kind === 'row') {
          return (
            <CanvasRow
              key={block.row.id}
              row={block.row}
              linkedLabels={linkedLabels}
              offsetY={displacement.rows.get(block.row.id) ?? 0}
              onFieldContextMenu={onFieldContextMenu}
            />
          )
        }

        const group: RepeatableGroup | undefined = (groups ?? []).find(
          (candidate) => candidate.id === block.groupId,
        )

        if (!group) {
          return block.rows.map((row) => (
            <CanvasRow
              key={row.id}
              row={row}
              linkedLabels={linkedLabels}
              offsetY={displacement.rows.get(row.id) ?? 0}
              onFieldContextMenu={onFieldContextMenu}
            />
          ))
        }

        return (
          <RepeatableGroupBand
            key={group.id}
            group={group}
            rows={block.rows}
            linkedLabels={linkedLabels}
            offsetY={displacement.bands.get(group.id) ?? 0}
            rowOffsets={displacement.rows}
            onFieldContextMenu={onFieldContextMenu}
          />
        )
      })}
    </ul>
  )
}
