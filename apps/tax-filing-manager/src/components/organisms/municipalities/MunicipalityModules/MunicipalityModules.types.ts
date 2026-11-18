import type { MunicipalitySwitches, PausasMunicipio } from '../../../../types'

export interface MunicipalityModulesProps {
  switches: MunicipalitySwitches
  pausas: PausasMunicipio
  change: (partial: Partial<MunicipalitySwitches>) => void
}
