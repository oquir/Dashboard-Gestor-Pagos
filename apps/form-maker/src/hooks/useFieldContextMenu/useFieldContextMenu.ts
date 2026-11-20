import { useEffect, useState } from 'react'
import { findFieldById, getActiveRows, useFormStore } from '../../store/formStore'
import type { ContextMenuTab } from '../../types/fieldContextMenu'
import type {
  UseFieldContextMenuParams,
  UseFieldContextMenuResult,
} from './useFieldContextMenu.types'
import { getMenuPosition } from './useFieldContextMenu.utils'

// Menu contextual del campo: no se estima su alto; recibe el maximo que cabe y el cuerpo hace
// scroll.
export function useFieldContextMenu({
  menu,
  onClose,
}: UseFieldContextMenuParams): UseFieldContextMenuResult {
  const [activeTab, setActiveTab] = useState<ContextMenuTab>('attributes')
  const activeRows = useFormStore(getActiveRows)
  const removeFields = useFormStore((state) => state.removeFields)
  const field = findFieldById(activeRows, menu.fieldId)

  function handleSelectTab(tab: ContextMenuTab): void {
    setActiveTab(tab)
  }

  function handleDelete(): void {
    removeFields([menu.fieldId])
    onClose()
  }

  useEffect(() => {
    const handlePointerDown = (): void => onClose()
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return {
    field,
    activeTab,
    handleSelectTab,
    handleDelete,
    position: getMenuPosition(menu.x, menu.y, window.innerWidth, window.innerHeight),
  }
}
