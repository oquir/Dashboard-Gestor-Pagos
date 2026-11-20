import { useRef } from 'react'
import { MAX_ROW_COLUMNS, MIN_ROW_COLUMNS } from '../../../constants'
import { ROW_TOOLBAR_ITEM_CLASSES, ROW_TOOLBAR_POPOVER_CLASSES } from '../../../constants'
import { useClickOutside } from '../../../hooks'
import { useFormStore } from '../../../store'
import type { RowColumnsMenuProps } from './RowColumnsMenu.types'
import { Tooltip } from '../../atoms'

// El abierto/cerrado lo lleva la barra: los menus son excluyentes sin conocerse.
export function RowColumnsMenu({ rowId, columns, isOpen, onToggle, onClose }: RowColumnsMenuProps) {
  const updateRowColumns = useFormStore((state) => state.updateRowColumns)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useClickOutside(containerRef, onClose, isOpen)

  return (
    <div ref={containerRef} className="relative">
      <Tooltip content="Cambiar columnas de la fila">
        <button type="button" onClick={onToggle} className={ROW_TOOLBAR_ITEM_CLASSES}>
          {columns} col
        </button>
      </Tooltip>
      {isOpen && (
        <div className={ROW_TOOLBAR_POPOVER_CLASSES}>
          <label htmlFor={`row-columns-${rowId}`} className="text-[11px] font-medium text-fg-muted">
            Columnas de la fila
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`row-columns-${rowId}`}
              type="number"
              min={MIN_ROW_COLUMNS}
              max={MAX_ROW_COLUMNS}
              value={columns}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10)
                if (Number.isNaN(parsed)) return
                updateRowColumns(rowId, parsed)
              }}
              className="w-14 rounded-md border border-border bg-field px-2 py-1 text-sm text-fg outline-none focus:border-brand-border"
            />
            <input
              type="range"
              min={MIN_ROW_COLUMNS}
              max={MAX_ROW_COLUMNS}
              value={columns}
              onChange={(event) => updateRowColumns(rowId, Number.parseInt(event.target.value, 10))}
              className="flex-1 accent-brand cursor-grab active:cursor-grabbing"
            />
          </div>
          <p className="text-[10px] text-fg-muted">
            Los campos que excedan se ajustan automaticamente.
          </p>
        </div>
      )}
    </div>
  )
}
