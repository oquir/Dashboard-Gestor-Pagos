import { Redo, Undo } from 'reicon-react'
import {
  CANVAS_TOOLBAR_GROUP_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../constants/uiClasses'
import { Tooltip } from '../../atoms'
import type { HistoryButtonsProps } from './HistoryButtons.types'

// No sabe de que historial es (formulario o PDF). El span deja salir el tooltip con el boton
// deshabilitado.
export function HistoryButtons({ canUndo, canRedo, onUndo, onRedo }: HistoryButtonsProps) {
  return (
    <div className={CANVAS_TOOLBAR_GROUP_CLASSES}>
      <Tooltip content="Deshacer (Ctrl+Z)">
        <span className="inline-flex">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Deshacer"
            className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES}
          >
            <Undo size={15} />
          </button>
        </span>
      </Tooltip>
      <Tooltip content="Rehacer (Ctrl+Y)">
        <span className="inline-flex">
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Rehacer"
            className={CANVAS_TOOLBAR_ICON_ACTION_CLASSES}
          >
            <Redo size={15} />
          </button>
        </span>
      </Tooltip>
    </div>
  )
}
