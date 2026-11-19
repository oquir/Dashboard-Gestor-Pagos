import { OrigamiLoader } from '../OrigamiLoader'
import type { SimulatorLoadingProps } from './SimulatorLoading.types'

// Lo que se ve mientras baja un chunk perezoso a pantalla completa: el simulador o el diseñador
// de PDF.
export function SimulatorLoading({ label = 'Cargando simulador…' }: SimulatorLoadingProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-surface-sunken">
      <OrigamiLoader label={label} />
    </div>
  )
}
