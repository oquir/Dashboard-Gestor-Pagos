import { DocumentDownload2 } from 'reicon-react'
import { useExportReview } from '../../../hooks/useExportReview/useExportReview'
import { ExportReviewModal } from '../ExportReviewModal/ExportReviewModal'
import { EXPORT_BUTTON_CLASSES } from './ExportButton.constants'
import type { ExportButtonProps } from './ExportButton.types'
import { downloadCurrentForm } from './ExportButton.utils'
import { Tooltip } from '../../atoms'

const LABEL: string = 'Revisar el formulario y descargarlo como JSON'

// Dueno de su revision y su modal. El panel y el chip nunca coexisten: hay un solo boton vivo.
export function ExportButton({ iconOnly = false }: ExportButtonProps) {
  const { problems, hasErrors, request, proceedAnyway, goTo, close } =
    useExportReview(downloadCurrentForm)

  return (
    <>
      <Tooltip content={LABEL}>
        <button
          type="button"
          onClick={request}
          aria-label={iconOnly ? LABEL : undefined}
          className={EXPORT_BUTTON_CLASSES}
        >
          <DocumentDownload2 size={13} />
          {!iconOnly && 'Exportar'}
        </button>
      </Tooltip>

      {problems && (
        <ExportReviewModal
          action="export"
          problems={problems}
          hasErrors={hasErrors}
          onGoTo={goTo}
          onProceed={proceedAnyway}
          onClose={close}
        />
      )}
    </>
  )
}
