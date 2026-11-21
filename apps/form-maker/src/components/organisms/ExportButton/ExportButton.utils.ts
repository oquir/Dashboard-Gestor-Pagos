import { downloadFormExport } from '../../../lib'
import { useFormStore } from '../../../store'

export function downloadCurrentForm(): void {
  const { formSteps, setupConfig, introModal, formScript } = useFormStore.getState()
  downloadFormExport(formSteps, setupConfig, introModal.steps, formScript)
}
