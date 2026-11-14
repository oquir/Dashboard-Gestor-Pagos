import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { ComponentType, CSSProperties } from 'react'
import { BranchDown, Eye, InfoCircle, Lock, Xmark } from 'reicon-react'
import { GRID_BASE_COLUMNS } from '../../../constants/grid'
import { CHROME_ON_FIELD_CLASSES, CHROME_PINNED_CLASSES } from '../../../constants/uiClasses'
import { resolveFieldStyles } from '../../../lib/cssStyles/cssStyles'
import { hasTooltip } from '../../../lib/fieldTooltip/fieldTooltip'
import { getFreeRuns, getMaxSpanAt } from '../../../lib/rowLayout/rowLayout'
import { useFormStore } from '../../../store/formStore'
import type { IconProps } from '../../../types/icon'
import { FieldDragHandle } from '../../atoms/FieldDragHandle/FieldDragHandle'
import { FieldResizeHandle } from '../../atoms/FieldResizeHandle/FieldResizeHandle'
import { FieldTypeBadge } from '../../atoms/FieldTypeBadge/FieldTypeBadge'
import { IconButton } from '../../atoms/IconButton/IconButton'
import { FieldPreviewControl } from '../FieldPreviewControl/FieldPreviewControl'
import { TooltipBubble } from '../TooltipBubble/TooltipBubble'
import {
  DELETE_BUTTON_CLASSES,
  DESTINATION_COLOR_CLASSES,
  DESTINATION_ICONS,
  DESTINATION_SYMBOL_CLASSES,
  STATE_ICON_CLASSES,
} from './CanvasFieldChip.constants'
import type { CanvasFieldChipProps, FieldDestination } from './CanvasFieldChip.types'
import {
  getChipBorderClasses,
  getChipPaddingClasses,
  getDestinationTitle,
  getFieldDestination,
} from './CanvasFieldChip.utils'

export function CanvasFieldChip({
  field,
  rowId,
  rowColumns,
  rowFields,
  linkedLabel,
  selected,
  pinned,
  onClick,
  onContextMenu,
}: CanvasFieldChipProps) {
  const updateField = useFormStore((state) => state.updateField)
  const removeFields = useFormStore((state) => state.removeFields)
  const selectFieldAndEdit = useFormStore((state) => state.selectFieldAndEdit)
  const maxSpan = getMaxSpanAt(getFreeRuns(rowFields, rowColumns, field.id), field.colStart)

  const {
    listeners,
    attributes,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: field.id,
    data: { source: 'canvas-field', field, rowId },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: field.id,
    data: { rowId, fieldId: field.id },
  })

  function setRefs(node: HTMLDivElement | null): void {
    setDragRef(node)
    setDropRef(node)
  }

  const isUltraCompact = field.colSpan === 1 && rowColumns >= GRID_BASE_COLUMNS
  const isCompact = rowColumns >= 13 && field.colSpan === 1
  const shouldHideContent = field.colSpan === 1 && rowColumns >= 14
  const showTooltip: boolean = hasTooltip(field)
  const destination: FieldDestination = getFieldDestination(field)
  const DestinationIcon: ComponentType<IconProps> | undefined = DESTINATION_ICONS[destination]
  const destinationTitle: string = getDestinationTitle(field, destination)
  // El margen se queda en el div de arriba (relative, con el handle y el resize anclados a el):
  // aplicarlo aca correria el boton por dentro sin mover a sus hermanos absolutos. El resto --
  // fondo, color y el CSS libre -- va sobre la caja pintada, nunca sobre el div que solo lleva
  // gridColumn, porque ese es el que fija la posicion en la fila.
  const { marginTop, marginBottom, ...buttonStyles } = resolveFieldStyles(field.styles)
  const chromeClasses: string = pinned ? CHROME_PINNED_CLASSES : CHROME_ON_FIELD_CLASSES

  return (
    <div
      ref={setRefs}
      data-field-id={field.id}
      style={{ gridColumn: `${field.colStart} / span ${field.colSpan}`, gridRow: 1 }}
      // El grupo lleva nombre: la fila es antecesora del chip, y un `group` a secas dejaria que
      // pasar por encima de la fila encendiera de golpe el cromo de todos sus campos.
      className={`group/field relative min-w-0 ${isDragging ? 'opacity-40' : ''}`}
    >
      <div
        className={`relative group/tooltip ${isOver ? 'rounded-md outline-2 outline-brand' : ''}`}
        style={{ marginTop, marginBottom }}
      >
        <FieldDragHandle
          listeners={listeners}
          attributes={attributes}
          colSpan={field.colSpan}
          rowColumns={rowColumns}
          pinned={pinned}
        />
        <button
          type="button"
          onClick={onClick}
          onDoubleClick={() => selectFieldAndEdit(field.id, 'attributes')}
          onContextMenu={onContextMenu}
          style={buttonStyles as CSSProperties}
          className={`relative flex w-full flex-col rounded-md border bg-white py-3 text-left shadow-sm transition-colors dark:bg-neutral-800 ${getChipPaddingClasses(
            isCompact,
            isUltraCompact,
          )} ${getChipBorderClasses(selected, destination)}`}
        >
          <div className="@container flex flex-col gap-1.5">
            <div
              className={`flex flex-wrap items-start gap-x-2 overflow-hidden ${shouldHideContent ? 'opacity-0' : ''}`}
            >
              <div className="flex w-min min-w-0 grow items-center gap-1">
                {linkedLabel ? (
                  <p
                    title={`La etiqueta la aporta "${linkedLabel.label}"`}
                    className="text-sm font-medium italic text-fg-muted"
                  >
                    {linkedLabel.label}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-700 dark:text-neutral-200">
                    {field.label}
                  </p>
                )}
                {showTooltip && <InfoCircle size={12} className="shrink-0 text-fg-subtle" />}
              </div>
              {/* Iconos monocromos y sin fondo: eran tres pildoras de tres colores que le disputaban
                el naranja a la seleccion. El detalle sigue en el title y en el panel de logica.
                Se ven solo si caben al lado de la palabra mas larga del nombre: el nombre mide eso
                (w-min) al repartir el renglon, y si no queda lugar el flex-wrap baja los iconos a
                una segunda linea de alto cero, que el overflow-hidden de arriba no deja ver. Cada
                campo decide con su propio nombre y su ancho real, sin un corte fijo. */}
              <div className="ml-auto h-0 shrink-0">
                <div className="flex h-5 items-center gap-1.5">
                  {field.visibleWhen && (
                    <span title="Visibilidad condicional" className={STATE_ICON_CLASSES}>
                      <Eye size={11} weight="Filled" />
                    </span>
                  )}
                  {field.alwaysDisabled && (
                    <span
                      title="Siempre deshabilitado (solo lectura)"
                      className={STATE_ICON_CLASSES}
                    >
                      <Lock size={11} weight="Filled" />
                    </span>
                  )}
                  {!field.alwaysDisabled && field.enableWhen && (
                    <span title="Habilitación condicional" className={STATE_ICON_CLASSES}>
                      <BranchDown size={11} weight="Filled" />
                    </span>
                  )}
                  <FieldTypeBadge type={field.type} />
                </div>
              </div>
            </div>
            <div className={shouldHideContent ? 'opacity-0' : ''}>
              <FieldPreviewControl field={field} />
            </div>
          </div>
          {/* Tan angosto que el contenido no entra: en lugar de una tarjeta en blanco, el icono
              del tipo, que es lo unico que cabe y lo unico que hace falta para reconocerlo. */}
          {shouldHideContent && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <FieldTypeBadge type={field.type} size={14} />
            </span>
          )}
          {DestinationIcon && (
            <span
              role="img"
              aria-label={destinationTitle}
              title={destinationTitle}
              className={`${DESTINATION_SYMBOL_CLASSES} ${DESTINATION_COLOR_CLASSES[destination]}`}
            >
              <DestinationIcon size={12} />
            </span>
          )}
        </button>
        {showTooltip && field.tooltip && <TooltipBubble tooltip={field.tooltip} />}
        <IconButton
          onClick={() => removeFields([field.id])}
          title="Eliminar campo"
          aria-label="Eliminar campo"
          className={`${DELETE_BUTTON_CLASSES} ${chromeClasses}`}
        >
          <Xmark size={11} weight="Filled" />
        </IconButton>
        <FieldResizeHandle
          colSpan={field.colSpan}
          rowColumns={rowColumns}
          maxSpan={maxSpan}
          pinned={pinned}
          onResize={(next) => updateField(field.id, { colSpan: next })}
        />
      </div>
    </div>
  )
}
