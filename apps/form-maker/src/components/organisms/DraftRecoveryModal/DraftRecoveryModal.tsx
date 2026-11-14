import { Button } from '../../atoms'
import { ModalActions } from '../../atoms'
import { ModalShell } from '../../atoms'
import { FieldRenameNotice } from '../../molecules'
import type { DraftRecoveryModalProps } from './DraftRecoveryModal.types'

export function DraftRecoveryModal({
  draft,
  renamed,
  onRestore,
  onDiscard,
}: DraftRecoveryModalProps) {
  const savedAtLabel = new Date(draft.savedAt).toLocaleString()

  return (
    <ModalShell
      maxWidthClassName="max-w-md"
      title="Se encontró un borrador"
      footer={
        <ModalActions>
          <Button
            variant="ghost"
            onClick={onDiscard}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Empezar de nuevo
          </Button>
          <Button
            variant="primary"
            onClick={onRestore}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Restaurar borrador
          </Button>
        </ModalActions>
      }
    >
      <p className="text-sm text-slate-500 dark:text-neutral-400">
        Hay un proyecto guardado automáticamente el {savedAtLabel}. ¿Quieres restaurarlo o empezar
        de nuevo?
      </p>

      <FieldRenameNotice renamed={renamed} />
    </ModalShell>
  )
}
