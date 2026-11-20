import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { CSSProperties, MouseEvent } from 'react'
import { resolveRowStyles } from '../../../lib'
import { getSelectedFieldId, useFormStore } from '../../../store'
import { CanvasFieldChip } from '../../molecules'
import { RowZoneOverlay } from '../../molecules'
import { RowToolbar } from '../RowToolbar'
import type { CanvasRowProps } from './CanvasRow.types'
import { getRowBorderClasses } from './CanvasRow.utils'
import { ENTER_ROW_CLASSES } from '../../../constants'

export function CanvasRow({
  row,
  linkedLabels,
  offsetY = 0,
  enterIndex,
  onFieldContextMenu,
}: CanvasRowProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: row.id, data: { rowId: row.id } })
  const {
    listeners,
    attributes,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({ id: row.id, data: { source: 'canvas-row', row } })
  const selectedFieldIds = useFormStore((state) => state.selectedFieldIds)
  const singleSelectedId = useFormStore(getSelectedFieldId)
  const canvasTool = useFormStore((state) => state.canvasTool)
  const selectField = useFormStore((state) => state.selectField)
  const toggleFieldSelection = useFormStore((state) => state.toggleFieldSelection)
  const dragPlacement = useFormStore((state) => state.dragPlacement)
  const rowDropTarget = useFormStore((state) => state.rowDropTarget)
  const isRowDragActive = useFormStore((state) => state.rowDrag !== null)
  const zonePlacement = dragPlacement?.rowId === row.id ? dragPlacement : null
  // Solo se marca el rechazo: el hueco ya dice donde cae.
  const rejected = rowDropTarget?.rowId === row.id && !rowDropTarget.isValid
  // Cromo fijo solo con seleccion unica y Mover: es el camino del teclado y de lo tactil.
  const pinnedFieldId: string | null = canvasTool === 'move' ? singleSelectedId : null
  const pinned: boolean = row.fields.some((field) => field.id === pinnedFieldId)

  function setRefs(node: HTMLLIElement | null): void {
    setDropRef(node)
    setDragRef(node)
  }

  // Shift, Ctrl o Cmd suman a la seleccion.
  function handleFieldClick(event: MouseEvent<HTMLButtonElement>, fieldId: string): void {
    if (canvasTool === 'select' || event.shiftKey || event.ctrlKey || event.metaKey) {
      toggleFieldSelection(fieldId)
      return
    }

    selectField(fieldId)
  }

  return (
    <li
      ref={setRefs}
      data-canvas-row=""
      data-row-id={row.id}
      style={
        {
          // Lo estructural al final: el CSS libre del autor no puede pisar la grilla.
          ...resolveRowStyles(row.styles),
          gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))`,
          transform: offsetY === 0 ? undefined : `translateY(${offsetY}px)`,
          '--enter-index': enterIndex,
        } as CSSProperties
      }
      // La transicion depende del mismo estado que el transform: al soltar se van juntas y la fila
      // no salta.
      className={`group/row relative col-span-16 grid gap-3 rounded-md border-2 p-3 ${
        enterIndex === undefined ? '' : ENTER_ROW_CLASSES
      } ${
        isRowDragActive
          ? 'transition-transform duration-200 ease-[cubic-bezier(0.34,1.6,0.5,1)]'
          : 'transition-colors'
      } ${
        // Invisible y no atenuada: las vecinas se corren su alto y pasarian por encima de un
        // fantasma.
        isDragging ? 'opacity-0' : ''
      } ${getRowBorderClasses({ isOver, isEmpty: row.fields.length === 0, pinned })}`}
    >
      <RowToolbar row={row} listeners={listeners} attributes={attributes} pinned={pinned} />

      {rejected && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 z-20 h-1 rounded-full bg-red-500 dark:bg-red-400 ${
            rowDropTarget.edge === 'before' ? '-top-2' : '-bottom-2'
          }`}
        />
      )}

      {row.fields.length === 0 && (
        <div
          style={{ gridColumn: `span ${row.columns} / span ${row.columns}` }}
          className="flex h-24 items-center justify-center text-sm text-fg-muted"
        >
          Suelta un campo aquí
        </div>
      )}

      {row.fields.map((field) => (
        <CanvasFieldChip
          key={field.id}
          field={field}
          rowId={row.id}
          rowColumns={row.columns}
          rowFields={row.fields}
          linkedLabel={linkedLabels.get(field.id) ?? null}
          selected={selectedFieldIds.includes(field.id)}
          pinned={field.id === pinnedFieldId}
          onClick={(event) => handleFieldClick(event, field.id)}
          onContextMenu={(event) => {
            event.preventDefault()
            selectField(field.id)
            onFieldContextMenu(field.id, event.clientX, event.clientY)
          }}
        />
      ))}
      {zonePlacement && <RowZoneOverlay columns={row.columns} placement={zonePlacement} />}
    </li>
  )
}
