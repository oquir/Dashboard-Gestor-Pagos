import './index.css'
import { DraftRecoveryModal } from './components/organisms'
import { Toaster } from './components/molecules'
import { FormBuilder } from './components/organisms'
import { SetupWizardModal } from './components/organisms'
import { useAutosave } from './hooks'
import { useDraftRecovery } from './hooks'
import { useKeyboardShortcuts } from './hooks'
import { usePerformanceClass } from './hooks'
import { useThemeClass } from './hooks'
import { useFormStore } from './store'
import type { DraftRecovery } from './types'

function App() {
  const isSetupComplete = useFormStore((state) => state.setupConfig.isComplete)
  const draftRecovery: DraftRecovery = useDraftRecovery()

  useThemeClass()
  usePerformanceClass()
  useAutosave()
  useKeyboardShortcuts()

  if (draftRecovery.status === 'loading') {
    return null
  }

  if (draftRecovery.draft) {
    return (
      <DraftRecoveryModal
        draft={draftRecovery.draft}
        renamed={draftRecovery.renamed}
        onRestore={draftRecovery.restore}
        onDiscard={draftRecovery.discard}
      />
    )
  }

  if (!isSetupComplete) {
    return <SetupWizardModal draftWasInvalid={draftRecovery.wasInvalid} />
  }

  // Un solo Toaster para el constructor y el disenador de PDF (FormBuilder monta uno u otro).
  return (
    <>
      <FormBuilder />
      <Toaster />
    </>
  )
}

export default App
