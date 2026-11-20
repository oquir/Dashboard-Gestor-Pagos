import { OrigamiLoader } from '../OrigamiLoader'
import type { SimulatorLoadingProps } from './SimulatorLoading.types'

// Pantalla de carga de los chunks perezosos (simulador y disenador de PDF).
export function SimulatorLoading({ label = 'Cargando simulador…' }: SimulatorLoadingProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-sunken">
      <OrigamiLoader label={label} />
    </div>
  )
}
