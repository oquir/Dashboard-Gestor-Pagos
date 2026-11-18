import { Redo, Undo } from 'reicon-react'
import {
  CANVAS_TOOLBAR_GROUP_CLASSES,
  CANVAS_TOOLBAR_ICON_ACTION_CLASSES,
} from '../../../constants/uiClasses'
import { Tooltip } from '../../atoms'
import type { HistoryButtonsProps } from './HistoryButtons.types'

// Deshacer / Rehacer de las barras flotantes. No sabe de que historial son: el del formulario y el
// del PDF son stores distintos, y cada barra le pasa el suyo. El span que envuelve al boton es
// porque un boton deshabilitado no recibe el puntero y su tooltip no saldria.
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
