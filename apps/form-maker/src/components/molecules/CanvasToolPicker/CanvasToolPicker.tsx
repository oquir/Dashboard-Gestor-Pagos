import { CANVAS_TOOLS } from '../../../constants/canvasTool'
import {
  CANVAS_TOOL_BUTTON_ACTIVE_CLASSES,
  CANVAS_TOOL_BUTTON_BASE_CLASSES,
  CANVAS_TOOL_BUTTON_INACTIVE_CLASSES,
  CANVAS_TOOLBAR_GROUP_CLASSES,
} from '../../../constants/uiClasses'
import { Tooltip } from '../../atoms'
import { TOOL_ICONS } from './CanvasToolPicker.constants'
import type { CanvasToolPickerProps } from './CanvasToolPicker.types'

// Lo comparten las barras del formulario y del PDF; quien lo monta guarda la herramienta.
export function CanvasToolPicker({ tool, onSelect }: CanvasToolPickerProps) {
  return (
    <div className={CANVAS_TOOLBAR_GROUP_CLASSES}>
      {CANVAS_TOOLS.map((item) => {
        const Icon = TOOL_ICONS[item.tool]
        const isActive: boolean = tool === item.tool

        return (
          <Tooltip key={item.tool} content={`${item.label} (${item.shortcut})`}>
            <button
              type="button"
              onClick={() => onSelect(item.tool)}
              aria-pressed={isActive}
              aria-label={item.label}
              className={`${CANVAS_TOOL_BUTTON_BASE_CLASSES} ${
                isActive ? CANVAS_TOOL_BUTTON_ACTIVE_CLASSES : CANVAS_TOOL_BUTTON_INACTIVE_CLASSES
              }`}
            >
              <Icon size={16} />
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
