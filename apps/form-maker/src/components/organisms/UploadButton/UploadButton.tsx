import { CloudUpload } from 'reicon-react'
import { useExportReview } from '../../../hooks/useExportReview/useExportReview'
import { useFormUpload } from '../../../hooks/useFormUpload/useFormUpload'
import { ExportReviewModal } from '../ExportReviewModal/ExportReviewModal'
import { UPLOAD_BUTTON_CLASSES, UPLOAD_LABEL, UPLOADING_LABEL } from './UploadButton.constants'
import type { UploadButtonProps } from './UploadButton.types'
import { Spinner, Tooltip } from '../../atoms'

// La accion principal: pasa por la misma revision que Exportar y sube el JSON a la API.
export function UploadButton({ iconOnly = false }: UploadButtonProps) {
  const { isUploading, upload } = useFormUpload()
  const { problems, hasErrors, request, proceedAnyway, goTo, close } = useExportReview(upload)
  const label: string = isUploading ? UPLOADING_LABEL : UPLOAD_LABEL

  return (
    <>
      <Tooltip content={label}>
        <button
          type="button"
          onClick={request}
          disabled={isUploading}
          aria-busy={isUploading}
          aria-label={iconOnly ? label : undefined}
          className={UPLOAD_BUTTON_CLASSES}
        >
          {isUploading ? <Spinner className="size-[13px]" /> : <CloudUpload size={13} />}
          {!iconOnly && 'Subir'}
        </button>
      </Tooltip>

      {problems && (
        <ExportReviewModal
          action="upload"
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
