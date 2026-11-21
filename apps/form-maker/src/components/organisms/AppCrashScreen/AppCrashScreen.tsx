import { useState } from 'react'
import { downloadFormExport } from '../../../lib'
import { useFormStore } from '../../../store'
import { Button } from '../../atoms'
import { CrashPanel } from '../../molecules'
import { BACKUP_LABEL, BUTTON_CLASSES } from './AppCrashScreen.constants'
import type { AppCrashScreenProps, BackupStatus } from './AppCrashScreen.types'

// Ofrece descargar lo no guardado antes de recargar. No escribe localStorage a proposito: un estado
// roto pisaria el ultimo borrador bueno.
export function AppCrashScreen({ message }: AppCrashScreenProps) {
  const [backup, setBackup] = useState<BackupStatus>('idle')
  const hasProject: boolean = useFormStore.getState().setupConfig.isComplete

  const downloadBackup = (): void => {
    const { formSteps, setupConfig, introModal, formScript } = useFormStore.getState()
    try {
      downloadFormExport(formSteps, setupConfig, introModal.steps, formScript)
      setBackup('done')
    } catch {
      setBackup('failed')
    }
  }

  return (
    <CrashPanel
      title="Algo salió mal"
      description={
        <>
          <p>La aplicación encontró un error y no puede seguir mostrando el formulario.</p>
          {hasProject && (
            <p className="mt-2">
              Al recargar se recupera el último borrador guardado. Si hiciste cambios después de
              guardar, descarga primero una copia: se abre con <strong>Abrir formulario…</strong> o{' '}
              <strong>Cargar formulario</strong>.
            </p>
          )}
        </>
      }
      message={message}
    >
      {hasProject && (
        <Button
          variant="ghost"
          onClick={downloadBackup}
          disabled={backup !== 'idle'}
          className={BUTTON_CLASSES}
        >
          {BACKUP_LABEL[backup]}
        </Button>
      )}
      <Button variant="primary" onClick={() => window.location.reload()} className={BUTTON_CLASSES}>
        Recargar
      </Button>
    </CrashPanel>
  )
}
