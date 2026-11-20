import { useRef } from 'react'
import { Palette } from 'reicon-react'
import { ROW_TOOLBAR_ICON_ITEM_CLASSES, ROW_TOOLBAR_POPOVER_CLASSES } from '../../../constants'
import { useClickOutside } from '../../../hooks'
import { useFormStore } from '../../../store'
import { Label, Tooltip } from '../../atoms'
import { Textarea } from '../../atoms'
import { TwoColumnFieldGroup } from '../../atoms'
import { CssValidationHint } from '../../molecules'
import { PxInput } from '../../molecules'
import type { RowStylesMenuProps } from './RowStylesMenu.types'

// A proposito sin color de fondo ni de texto (ver types/formStructure). El abierto/cerrado lo lleva
// la barra.
export function RowStylesMenu({ rowId, styles, isOpen, onToggle, onClose }: RowStylesMenuProps) {
  const updateRowStyles = useFormStore((state) => state.updateRowStyles)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useClickOutside(containerRef, onClose, isOpen)

  return (
    <div ref={containerRef} className="relative">
      <Tooltip content="Estilos de la fila">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Estilos de la fila"
          className={ROW_TOOLBAR_ICON_ITEM_CLASSES}
        >
          <Palette size={12} />
        </button>
      </Tooltip>
      {isOpen && (
        <div className={`${ROW_TOOLBAR_POPOVER_CLASSES} gap-3`}>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`row-css-${rowId}`}>CSS personalizado</Label>
            <Textarea
              id={`row-css-${rowId}`}
              aria-label="CSS personalizado de la fila"
              value={styles?.customCss ?? ''}
              onChange={(event) => updateRowStyles(rowId, { customCss: event.target.value })}
              placeholder={'background: #f8fafc;\nborder-radius: 8px;'}
              spellCheck={false}
              rows={3}
              variant="code"
            />
            <CssValidationHint text={styles?.customCss ?? ''} />
          </div>

          <TwoColumnFieldGroup legend="Márgenes">
            <PxInput
              id={`row-margin-top-${rowId}`}
              label="Superior"
              value={styles?.marginTop ?? ''}
              onChange={(value) => updateRowStyles(rowId, { marginTop: value })}
            />
            <PxInput
              id={`row-margin-bottom-${rowId}`}
              label="Inferior"
              value={styles?.marginBottom ?? ''}
              onChange={(value) => updateRowStyles(rowId, { marginBottom: value })}
            />
          </TwoColumnFieldGroup>
        </div>
      )}
    </div>
  )
}
