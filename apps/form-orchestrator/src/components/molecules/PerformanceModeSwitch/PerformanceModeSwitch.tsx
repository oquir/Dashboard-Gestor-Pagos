import { SpeedLow } from 'reicon-react'
import { useFormStore } from '../../../store'
import { ToggleSwitch } from '../../atoms'

// Pie del panel derecho. La explicacion va a la vista y no en un InfoHint: la burbuja de ese abre
// hacia abajo, y al pie del panel la recortaria el overflow-hidden del aside.
export function PerformanceModeSwitch() {
  const isLowPerformance = useFormStore((state) => state.isLowPerformance)
  const toggleLowPerformance = useFormStore((state) => state.toggleLowPerformance)

  return (
    <div className="flex flex-col gap-1 border-t border-border px-3 py-2.5">
      <div className="flex items-center gap-2">
        <SpeedLow
          size={14}
          className={isLowPerformance ? 'shrink-0 text-brand-fg' : 'shrink-0 text-fg-subtle'}
        />
        <span className="text-xs font-medium text-fg">Bajo rendimiento</span>
        <div className="ml-auto flex">
          <ToggleSwitch
            checked={isLowPerformance}
            onChange={() => toggleLowPerformance()}
            label="Modo de bajo rendimiento"
          />
        </div>
      </div>
      <p className="text-[10px] leading-snug text-fg-subtle">
        Para equipos lentos: quita animaciones y aligera el zoom con la rueda y el arrastre de
        filas.
      </p>
    </div>
  )
}
