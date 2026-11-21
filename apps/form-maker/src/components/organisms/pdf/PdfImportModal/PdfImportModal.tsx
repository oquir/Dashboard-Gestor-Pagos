import { FILE_ERROR_BOX_CLASSES, FILE_SUMMARY_BOX_CLASSES } from '../../../../constants'
import { usePdfImport } from '../../../../hooks/usePdfImport'
import { Button, ModalActions, ModalShell } from '../../../atoms'
import { FileChooser } from '../../../molecules'
import { PDF_FILE_ACCEPT } from './PdfImportModal.constants'
import type { PdfImportModalProps } from './PdfImportModal.types'
import { choiceDetails } from './PdfImportModal.utils'

// El mismo modal que Abrir formulario, para la plantilla del PDF.
export function PdfImportModal({ onClose }: PdfImportModalProps) {
  const { status, choice, failures, canOpen, pickFiles, openChosen } = usePdfImport()

  function handleOpen(): void {
    openChosen()
    onClose()
  }

  return (
    <ModalShell
      maxWidthClassName="max-w-md"
      title="Abrir plantilla"
      onClose={onClose}
      footer={
        <ModalActions>
          <Button
            variant="ghost"
            onClick={onClose}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!canOpen}
            onClick={handleOpen}
            className="px-4 py-1.5 text-sm hover:cursor-pointer"
          >
            Abrir plantilla
          </Button>
        </ModalActions>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-soft">
          Elige un <strong>.html</strong> de FormMaker o una plantilla hecha a mano. Con varios,
          vale el de versión más alta. Reemplaza el diseño actual; Ctrl+Z lo trae de vuelta.
        </p>

        <FileChooser
          accept={PDF_FILE_ACCEPT}
          multiple
          ariaLabel="Plantilla .html"
          status={status}
          onPick={(files) => void pickFiles(files)}
        />

        {failures.length > 0 && (
          <div className={FILE_ERROR_BOX_CLASSES}>
            {failures.map((failure) => (
              <p key={failure}>{failure}</p>
            ))}
          </div>
        )}

        {choice && (
          <div className={FILE_SUMMARY_BOX_CLASSES}>
            <p className="truncate text-sm font-medium text-fg-strong">{choice.fileName}</p>
            {choiceDetails(choice).map((line) => (
              <p key={line} className="text-xs text-fg-muted">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  )
}
