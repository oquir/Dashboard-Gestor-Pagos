import { useFieldResize } from '../../../hooks'
import type { FieldResizeHandleVariantProps } from '../../../types'
import { FieldResizeHandleBar } from '../FieldResizeHandleBar'
import { FieldResizeHandleKnob } from '../FieldResizeHandleKnob'
import type { FieldResizeHandleProps } from './FieldResizeHandle.types'

export function FieldResizeHandle({
  colSpan,
  rowColumns,
  maxSpan,
  pinned,
  onResize,
}: FieldResizeHandleProps) {
  const { isResizing, handlePointerDown } = useFieldResize({
    colSpan,
    rowColumns,
    maxSpan,
    onResize,
  })

  // En un campo angosto el tirador redondo lo taparia entero: se usa una barra.
  const isCompact: boolean = rowColumns / colSpan >= 8
  const handleProps: FieldResizeHandleVariantProps = {
    isResizing,
    title: `Redimensionar (${colSpan}/${rowColumns})`,
    pinned,
    onPointerDown: handlePointerDown,
  }

  return isCompact ? (
    <FieldResizeHandleBar {...handleProps} />
  ) : (
    <FieldResizeHandleKnob {...handleProps} />
  )
}
