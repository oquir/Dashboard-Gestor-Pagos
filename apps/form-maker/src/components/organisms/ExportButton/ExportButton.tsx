import { DirectSend2 } from 'reicon-react'
import { useExportReview } from '../../../hooks/useExportReview/useExportReview'
import { ExportReviewModal } from '../ExportReviewModal/ExportReviewModal'
import { EXPORT_BUTTON_CLASSES } from './ExportButton.constants'
import type { ExportButtonProps } from './ExportButton.types'
import { Tooltip } from '../../atoms'

const LABEL: string = 'Revisar el formulario y descargarlo como JSON'

// Dueno de la revision y su modal. El panel y el chip nunca coexisten: hay un solo useExportReview
// vivo.
export function ExportButton({ iconOnly = false }: ExportButtonProps) {
  const { problems, hasErrors, requestExport, exportAnyway, goTo, close } = useExportReview()

  return (
    <>
      <Tooltip content={LABEL}>
        <button
          type="button"
          onClick={requestExport}
          aria-label={iconOnly ? LABEL : undefined}
          className={EXPORT_BUTTON_CLASSES}
        >
          <DirectSend2 size={13} />
          {!iconOnly && 'Exportar'}
        </button>
      </Tooltip>

      {problems && (
        <ExportReviewModal
          problems={problems}
          hasErrors={hasErrors}
          onGoTo={goTo}
          onExport={exportAnyway}
          onClose={close}
        />
      )}
    </>
  )
}
