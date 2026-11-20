import { useState } from 'react'
import { SpeedLow } from 'reicon-react'
import {
  CANVAS_PERFORMANCE_ON_CLASSES,
  CANVAS_TOOL_BUTTON_BASE_CLASSES,
  CANVAS_TOOL_BUTTON_INACTIVE_CLASSES,
} from '../../../constants/uiClasses'
import { useFormStore } from '../../../store/formStore'
import { Tooltip } from '../../atoms'

// Preferencia de la app y no de un lienzo: vale en el formulario y en el PDF.
export function PerformanceModeToggle() {
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)
  const toggleLowPerformance = useFormStore((state) => state.toggleLowPerformance)
  // Cuenta los clics: es la key del icono y al remontarse repite el giro. En 0 no gira.
  const [spin, setSpin] = useState<number>(0)

  return (
    <Tooltip
      content={
        isLowPerformance
          ? 'Bajo rendimiento: prendido. Clic para apagarlo'
          : 'Bajo rendimiento: para equipos lentos, quita animaciones y aligera el zoom con la rueda y el arrastre de filas'
      }
    >
      <button
        type="button"
        onClick={() => {
          toggleLowPerformance()
          setSpin((count: number) => count + 1)
        }}
        aria-pressed={isLowPerformance}
        aria-label="Modo de bajo rendimiento"
        className={`${CANVAS_TOOL_BUTTON_BASE_CLASSES} ${
          isLowPerformance ? CANVAS_PERFORMANCE_ON_CLASSES : CANVAS_TOOL_BUTTON_INACTIVE_CLASSES
        }`}
      >
        <SpeedLow
          key={spin}
          size={16}
          // Prendido = espejado como estilo base, para que al terminar el giro no haya salto
          style={isLowPerformance ? { transform: 'scaleX(-1)' } : undefined}
          className={
            spin === 0
              ? undefined
              : isLowPerformance
                ? 'animate-performance-icon-on'
                : 'animate-performance-icon-off'
          }
        />
      </button>
    </Tooltip>
  )
}
