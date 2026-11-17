import type { BackupStatus } from './AppCrashScreen.types'

export const BUTTON_CLASSES: string = 'px-4 py-1.5 text-sm hover:cursor-pointer'

export const BACKUP_LABEL: Record<BackupStatus, string> = {
  idle: 'Descargar una copia',
  done: 'Copia descargada',
  failed: 'No se pudo armar la copia',
}
