import { Play } from 'reicon-react'
import { useFormStore } from '../../../store/formStore'
import { SIMULATOR_BUTTON_CLASSES } from './SimulatorButton.constants'
import type { SimulatorButtonProps } from './SimulatorButton.types'
import { Tooltip } from '../../atoms'

const LABEL: string = 'Probar el formulario como lo vería quien lo llena'

export function SimulatorButton({ iconOnly = false }: SimulatorButtonProps) {
  const setSimulatorOpen = useFormStore((state) => state.setSimulatorOpen)

  return (
    <Tooltip content={LABEL}>
      <button
        type="button"
        onClick={() => setSimulatorOpen(true)}
        aria-label={iconOnly ? LABEL : undefined}
        className={SIMULATOR_BUTTON_CLASSES}
      >
        <Play size={12} weight="Filled" />
        {!iconOnly && 'Simulador'}
      </button>
    </Tooltip>
  )
}
