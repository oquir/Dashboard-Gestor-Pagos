import type { StoreApi } from 'zustand'
import type { FormState } from './formStoreTypes'

// El documento mas el paso activo y la seleccion: deshacer muestra el cambio donde ocurrio.
export type HistorySnapshot = Pick<
  FormState,
  'formSteps' | 'introModal' | 'formScript' | 'setupConfig' | 'activeCanvas' | 'selectedFieldIds'
>

// El snapshot de antes del cambio que zundo pasa a handleSet.
export type HistoryPastState = Parameters<StoreApi<FormState>['setState']>[0]

export interface BurstGate {
  wrap<TArgs extends unknown[]>(fn: (...args: TArgs) => void): (...args: TArgs) => void
  reset(): void
}
